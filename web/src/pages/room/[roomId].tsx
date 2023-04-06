import { useRoomContext, useRoomDispatch } from "@/common/room.context";
import { useRootContext, useRootDispatch, useUsername } from "@/common/root.context";
import { connectToRoom, sendMessageIfOpen } from "@/components/room/common";
import { RoomHeader } from "@/components/room/header";
import { RoomSubheader } from "@/components/room/subheader";
import { SubmitBtn } from "@/components/room/submitBtn";
import { VotingCardList } from "@/components/votingCardList/votingCardList";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Board } from "../../components/board/board";
import { SpectatorList } from "../../components/spectatorList/spectatorList";
import styles from "./room.module.css";
let init = false;
let roomInit = false;
const Room = () => {
  const [socket, setSocket] = useState<WebSocket>();
  const [roomIsReady, setRoomIsReady] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const pingMSInterval = 5000;
  const pingInterval = useRef<NodeJS.Timer | undefined>();
  const roomDispatch = useRoomDispatch();
  const rootDispatch = useRootDispatch();
  const rootContext = useRootContext();
  const roomContext = useRoomContext();
  const { roomId } = rootContext;
  const { isSpectator } = rootContext;
  const username = useUsername();
  const voters = roomContext.voters;
  useEffect(() => {
    if (!router.isReady || roomInit) return;
    roomInit = true;
    const { roomId } = router.query;
    rootDispatch({ type: "setRoomId", payload: roomId as string });
    setRoomIsReady(true);
  }, [router.isReady, router.query]);
  useEffect(() => {
    if (init || !roomIsReady) return;
    init = true;
    if (typeof roomId !== "string") {
      router.push("/");
      throw new Error("no roomId");
    }
    if (!username) {
      router.push("/prejoin");
      return
    }
    setLoading(true);
    connectToRoom({ state: { ...roomContext, ...rootContext }, dispatch: roomDispatch }).then((socket) => {
      setSocket(socket);
      setLoading(false);
      pingInterval.current = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({ type: "ping" }));
        else clearInterval(pingInterval.current);
      }, pingMSInterval);
    }).catch((e) => {
      console.log(e);
      router.push("/");
    });
  }, [roomIsReady]);

  useEffect(() => () => {
    if (socket) {
      socket.close();
      setSocket(undefined);
      roomDispatch({ type: "reset" });
      clearInterval(pingInterval.current);
      setSelectedCard(null);
    }
    init = false;
    roomInit = false;
  }, [socket]);

  useEffect(() => {
    if (typeof selectedCard === "number") userVotes();
  }, [selectedCard]);


  useEffect(() => {
    if (isSpectator) {
      changeRole("spectator");
      setSelectedCard(null);
    } else {
      changeRole("voter");
    }
  }, [isSpectator]);

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
