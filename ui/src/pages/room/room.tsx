import { useNavigate, useParams } from "@solidjs/router";
import {
  Component,
  createEffect,
  createRenderEffect,
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
import {
  ProgressBar,
  ProgressBarDefaultDuration,
} from "../../components/progressBar/progressBar";
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
  averageScore,
  handleWsMessage,
  reavalable,
  revealed,
  revealing,
  voters,
} from "./roomState";

const roomHeaders = {
  Voting: "Voting is in session!",
  Ready: "Everyone's Ready",
  Revealing: "Revealing in",
  Revealed: "Average Score",
} as const;

const Room: Component = () => {
  const [roomHeader, setRoomHeader] = createSignal<string>(roomHeaders.Voting);
  createEffect(() => {
    if (reavalable()) setRoomHeader(roomHeaders.Ready);
    if (revealed()) setRoomHeader(roomHeaders.Revealed + " " + averageScore());
    if (!revealed() && !reavalable()) setRoomHeader(roomHeaders.Voting);
  });
  createEffect(() => {
    if (revealing()) {
      let i = ProgressBarDefaultDuration / 1000;
      setRoomHeader(roomHeaders.Revealing + " " + i);
      const interval = setInterval(() => {
        if (i === 0) {
          clearInterval(interval);
          return;
        }
        setRoomHeader(roomHeaders.Revealing + " " + --i);
      }, 1000);
    }
  });
  const navigate = useNavigate();
  const params = useParams();
  const roomId = params["roomId"];
  setRoomId(roomId);
  if (!username()) {
    navigate("/prejoin");
    return;
  }
  const [socket] = createResource(() => connectToRoom());
  createEffect(() => {
    if (selectedCard()) userVotes();
  });
  createEffect(() => {
    if (isSpectator()) {
      changeRole("spectator");
      setSelectedCard(null);
    } else {
      changeRole("voter");
    }
  });
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
  function revealRound() {
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
          <Show when={revealing()}>
            <ProgressBar />
          </Show>
        </div>
        <div class="row justify-between">
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
            action={() => setIsSpectator((v) => !v)}
            checked={isSpectator()}
          />
        </div>
        <div class="voting-area-wrapper">
          <div class="voting-area">
            <Board users={voters} />
            <Switch>
              <Match
                when={
                  reavalable() &&
                  typeof averageScore() !== "number" &&
                  !revealing()
                }
              >
                <Button action={revealRound}>
                  <span>Reveal Cards</span>
                </Button>
              </Match>
              <Match when={typeof averageScore() === "number"}>
                <Button action={startNewRound}>
                  <span>Start New Round</span>
                </Button>
              </Match>
              {/* <Match when={revealing()}>
                <Button>
                  <span>Cancel Reveal</span>
                </Button>
              </Match> */}
            </Switch>
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
    console.log("user", username(), "should connect to room", roomId());
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId()}/${username()}/${
        isSpectator() ? "spectator" : "voter"
      }`
    );
    socket.addEventListener("open", function (event) {
      console.log("connected", event);
      resolve(socket);
    });
    socket.addEventListener("message", handleWsMessage);
    socket.addEventListener("error", (event) => {
      console.log("Error from ws connection ", event);
      navigate("/");
      reject(event);
    });
  });
}
export default Room;
