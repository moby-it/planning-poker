import { useRevealing, useRoomContext, useRoomDispatch } from "@/common/room.context";
import { useRootContext } from "@/common/root.context";
import { connectToRoom, sendMessageIfOpen } from "@/components/room/common";
import { RoomHeader } from "@/components/room/header";
import { RoomSubheader } from "@/components/room/subheader";
import { SubmitBtn } from "@/components/room/submitBtn";
import { VotingCardList } from "@/components/votingCardList/votingCardList";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { log } from "../../common/analytics";
import { Board } from "../../components/board/board";
import { SpectatorList } from "../../components/spectatorList/spectatorList";
import styles from "./room.module.css";
let init = false;
let intervalStart = false;
const Room = () => {
  const [socket, setSocket] = useState<WebSocket>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { roomId } = router.query;
  if (typeof roomId !== "string") throw new Error("RoomId is not a string");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const pingMSInterval = 5000;
  const pingInterval = useRef<NodeJS.Timer | undefined>();
  const roomDispatch = useRoomDispatch();
  const rootContext = useRootContext();
  const revealing = useRevealing();
  const { isSpectator } = rootContext;
  const roomContext = useRoomContext();
  const username = rootContext.username;
  const voters = roomContext.voters;
  if (!username) {
    router.push("/prejoin");
    throw new Error("no username");
  }
  log("new_room");
  useEffect(() => {
    if (init) return;
    init = true;
    console.log('init effect ran');
    setLoading(true);
    connectToRoom({ state: { ...roomContext, ...rootContext }, dispatch: roomDispatch }).then((socket) => {
      setSocket(socket);
      setLoading(false);
      pingInterval.current = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({ type: "ping" }));
        else clearInterval(pingInterval.current);
      }, pingMSInterval);
    });
    return () => {
      if (socket) socket.close();
      clearInterval(pingInterval.current);
      setSelectedCard(null);
    };
  }, []);
  useEffect(() => {
    if (typeof selectedCard === "number") userVotes();
  }, [selectedCard]);


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
  if (loading)
    return <>{loading}</>;
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
