import { useNavigate, useParams } from "@solidjs/router";
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";
import toast from "solid-toast";
import {
  isSpectator,
  roomId,
  setIsSpectator,
  setRoomId,
  username,
} from "../../common/state";
import { Board } from "../../components/board/board";
import { Button } from "../../components/button/button";
import { ProgressBar } from "../../components/progressBar/progressBar";
import { SpectatorList } from "../../components/spectatorList/spectatorList";
import { Toggle } from "../../components/toggle/toggle";
import {
  selectedCard,
  setSelectedCard,
  VotingCardList,
} from "../../components/votingCardList/votingCardList";
import { wsv1Url } from "../../config";
import "./room.css";
import {
  handleWsMessage,
  revealable,
  revealed,
  revealing,
  revealingDuration,
  roundScore,
  roundStatus,
  RoundStatuses,
  voters,
} from "./roomState";

const roomHeaders = {
  Voting: "Voting is in session!",
  Ready: "Everyone's Ready",
  Revealing: "Revealing in",
  Revealed: "Average Score",
} as const;

const Room: Component = () => {
  let interval: NodeJS.Timer | undefined;
  const [roomHeader, setRoomHeader] = createSignal<string>(roomHeaders.Voting);
  createEffect(() => {
    switch (roundStatus()) {
      case RoundStatuses.Started:
        setRoomHeader(roomHeaders.Voting);
      case RoundStatuses.Revealable:
        setRoomHeader(roomHeaders.Ready);
        break;
      case RoundStatuses.Revealed:
        setRoomHeader(roomHeaders.Revealed + " " + roundScore());
        break;
    }
  });
  createEffect(() => {
    if (revealing()) {
      let i = revealingDuration() / 1000;
      setRoomHeader(roomHeaders.Revealing + " " + i);
      interval = setInterval(() => {
        if (i === 0) {
          clearInterval(interval);
          return;
        }
        setRoomHeader(roomHeaders.Revealing + " " + --i);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
  });

  const navigate = useNavigate();
  const params = useParams();
  const roomId = params["roomId"];
  const pingMSInterval = 5000;
  let pingInterval: NodeJS.Timer | undefined;
  setRoomId(roomId);
  if (!username()) {
    navigate("/prejoin");
    return;
  }
  const [socket] = createResource(() => connectToRoom());
  createEffect((prevWs) => {
    const ws = socket();
    if (ws?.readyState === WebSocket.CLOSED) {
      console.error(socket());
      toast.error("Connection Closed");
      navigate("/");
    }
    if (!prevWs && ws) {
      pingInterval = setInterval(() => {
        ws.send(JSON.stringify({ type: "ping" }));
      }, pingMSInterval);
    }
    if (prevWs && !ws) clearInterval(pingInterval);
    return ws;
  });
  createEffect(() => {
    if (typeof selectedCard() === "number") userVotes();
  });
  createEffect((prev) => {
    if (prev === isSpectator() || revealing()) return;
    if (isSpectator()) {
      changeRole("spectator");
      setSelectedCard(null);
    } else {
      changeRole("voter");
    }
    return isSpectator();
  }, isSpectator());
  function userVotes() {
    const ws = socket();
    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "userToVote",
        username: username(),
        storyPoints: selectedCard(),
        roomId,
      })
    );
  }
  function changeRole(role: string) {
    const ws = socket();
    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "changeRole",
        username: username(),
        role,
      })
    );
  }
  function toRevealRound() {
    const ws = socket();

    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "roundToReveal",
      })
    );
  }
  function cancelReveal() {
    const ws = socket();

    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "cancelReveal",
      })
    );
  }
  function startNewRound() {
    const ws = socket();

    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "roundToStart",
      })
    );
  }

  return (
    <Show
      when={!socket.loading}
      fallback={<p data-testid="loading">Connecting...</p>}
    >
      <div class="room" data-testid="room">
        <div class="room-header">
          <h2>{roomHeader()}</h2>
          <Show when={roundStatus() === RoundStatuses.Revealing}>
            <ProgressBar duration={revealingDuration()} />
          </Show>
        </div>
        <div class="room-subheader">
          <span
            class="primary cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(location.href);
              toast.success("Link Copied", {
                // icon is of primary color
                iconTheme: { primary: "#7cb7b0" },
              });
            }}
          >
            Copy Invite Link
          </span>
          <Toggle
            name="isSpectator"
            label="Join as Spectator"
            testId="spectator-toggle"
            disabled={revealing() || revealed()}
            action={() => setIsSpectator((v) => !v)}
            checked={isSpectator()}
          />
        </div>
        <div class="voting-area-wrapper">
          <div class="voting-area">
            <Board users={voters} />
            <Show when={!isSpectator()}>
              <Switch>
                <Match when={revealable()}>
                  <Button action={toRevealRound}>
                    <span>Reveal Cards</span>
                  </Button>
                </Match>
                <Match when={revealed()}>
                  <Button action={startNewRound}>
                    <span>Start New Round</span>
                  </Button>
                </Match>
                <Match when={revealing()}>
                  <Button color="default" action={() => cancelReveal()}>
                    <span>Cancel Reveal</span>
                  </Button>
                </Match>
              </Switch>
            </Show>
            <VotingCardList />
          </div>
          <div class="spectators">
            <SpectatorList />
          </div>
        </div>
      </div>
    </Show>
  );
};
async function connectToRoom(): Promise<WebSocket> {
  const navigate = useNavigate();
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId()}/${username()}/${
        isSpectator() ? "spectator" : "voter"
      }`
    );
    socket.addEventListener("open", function (event) {
      resolve(socket);
    });
    socket.addEventListener("message", handleWsMessage);
    socket.addEventListener("error", (event) => {
      navigate("/");
      reject(event);
    });
  });
}
export default Room;
