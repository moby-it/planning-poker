import { useRevealing, useRoomContext, useRoomDispatch } from "@/common/room.context";
import { useRootContext, useRootDispatch } from "@/common/root.context";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { log } from "../../common/analytics";
import { Board } from "../../components/board/board";
import { SpectatorList } from "../../components/spectatorList/spectatorList";
import { connectToRoom, sendMessageIfOpen } from "./common";
import { RoomHeader } from "./header";
import styles from "./room.module.css";
import { RoomSubheader } from "./subheader";
import { SubmitBtn } from "./submitBtn";
import { VotingCardList } from "../votingCardList/votingCardList";

const Room = async () => {
  const router = useRouter();
  const { roomId } = router.query;
  if (typeof roomId !== "string") throw new Error("RoomId is not a string");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const pingMSInterval = 5000;
  const pingInterval = useRef<NodeJS.Timer | undefined>();
  const rootDispatch = useRootDispatch();
  const roomDispatch = useRoomDispatch();
  const rootContext = useRootContext();
  const revealing = useRevealing();
  const { isSpectator } = rootContext;
  const roomContext = useRoomContext();
  const username = rootContext.username;
  const voters = roomContext.voters;
  rootDispatch({ type: "setRoomId", payload: roomId });
  if (!username) {
    router.push("/prejoin");
    throw new Error("no username");
  }
  log("new_room");
  const socket = await connectToRoom({ state: { ...roomContext, ...rootContext }, dispatch: roomDispatch });
  useEffect(() => {
    return () => {
      if (socket) socket.close();
      clearInterval(pingInterval.current);
      setSelectedCard(null);
    };
  });
  useEffect(() => {
    pingInterval.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify({ type: "ping" }));
      else clearInterval(pingInterval.current);
    }, pingMSInterval);
  });
  useEffect(() => {
    if (typeof selectedCard === "number") userVotes();
  });


  const lastRoleIsSpectator = useRef<boolean>(isSpectator);
  useEffect(() => {
    if (lastRoleIsSpectator.current === isSpectator || revealing) return;
    if (isSpectator) {
      changeRole("spectator");
      setSelectedCard(null);
    } else {
      changeRole("voter");
    }
  }, [isSpectator, revealing]);

  function changeRole(role: string) {
    sendMessageIfOpen(socket, {
      type: "changeRole",
      username: username,
      role,
    });
  }
  const userVotes = () =>
    sendMessageIfOpen(socket, {
      type: "userToVote",
      username: username,
      storyPoints: selectedCard,
      roomId,
    });

  return (
    <div className={styles.room} data-testid="room">
      <RoomHeader />
      <RoomSubheader />
      <div className={styles["voting-area-wrapper"]}>
        <div className={styles["voting-area"]}>
          <Board users={voters} />
          {!isSpectator && <SubmitBtn socket={socket} />}
          <VotingCardList selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        </div>
        <SpectatorList />
      </div>
    </div>
  );
};

export default Room;
