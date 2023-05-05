import { useNavigate, useParams } from "@solidjs/router";
import {
  Component,
  Show,
  Suspense,
  createEffect,
  createResource,
  onCleanup,
} from "solid-js";
import { log } from "../../common/analytics";
import { isSpectator, setRoomId, username } from "../../common/state";
import { Board } from "../../components/board/board";
import { SpectatorList } from "../../components/spectatorList/spectatorList";
import {
  VotingCardList,
  selectedCard,
  setSelectedCard,
} from "../../components/votingCardList/votingCardList";
import { connectToRoom, sendMessageIfOpen } from "./common";
import { RoomHeader } from "./header";
import "./room.css";
import { revealing, setSpectators, setVoters, voters } from "./roomState";
import { RoomSubheader } from "./subheader";
import { SubmitBtn } from "./submitBtn";

const Room: Component = () => {
  const navigate = useNavigate();
  const params = useParams();
  const roomId = params["roomId"];
  const pingMSInterval = 5 * 1000; // 15 seconds
  let pingInterval: NodeJS.Timer | undefined;
  setRoomId(roomId);
  if (!username()) {
    navigate("/prejoin");
    return;
  }
  log("new_room");
  const [socket, { refetch }] = createResource(() => connectToRoom());
  onCleanup(() => {
    if (!socket.error) socket()?.close();
    clearInterval(pingInterval);
    setSelectedCard(null);
    setVoters([]);
    setSpectators([]);
  });
  createEffect(() => {
    if (socket.loading) return;
    if (socket.error) return navigate("/");
    const ws = socket();
    if (!ws) return;
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: "ping" }));
      else {
        clearInterval(pingInterval);
        refetch();
      }
    }, pingMSInterval);
  });
  createEffect((prevCard) => {
    if (typeof selectedCard() === "number" && prevCard !== selectedCard()) userVotes();
    return selectedCard();
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
  });
  const userVotes = () =>
    sendMessageIfOpen(socket.latest, {
      type: "userToVote",
      username: username(),
      storyPoints: selectedCard(),
      roomId,
    });
  const changeRole = (role: string) =>
    sendMessageIfOpen(socket.latest, {
      type: "changeRole",
      username: username(),
      role,
    });

  return (
    <Suspense fallback={<p data-testid="loading">Connecting...</p>}>
      <div class="room" data-testid="room">
        <RoomHeader />
        <RoomSubheader />
        <div class="voting-area-wrapper">
          <div class="voting-area">
            <Board users={voters} />
            <Show when={!isSpectator()}>
              <SubmitBtn socket={socket()} />
            </Show>
            <VotingCardList />
          </div>
          <SpectatorList />
        </div>
      </div>
    </Suspense>
  );
};

export default Room;
