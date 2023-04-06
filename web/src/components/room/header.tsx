import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "../../components/progressBar/progressBar";
import { RoundStatuses, useRevealing, useRoomContext } from "@/common/room.context";
import styles from './room.module.css';
const roomHeaders = {
  Voting: "Voting is in session!",
  Ready: "Everyone's Ready",
  Revealing: "Revealing in",
  Revealed: "Average Score",
} as const;

export const RoomHeader = () => {
  let interval = useRef<NodeJS.Timer | number>();
  const { roundStatus, revealingDuration, roundScore } = useRoomContext();
  const revealing = useRevealing();
  const [roomHeader, setRoomHeader] = useState<string>(roomHeaders.Voting);
  useEffect(() => {
    switch (roundStatus) {
      case RoundStatuses.Started:
        setRoomHeader(roomHeaders.Voting);
        if (interval.current) clearInterval(interval.current);

      case RoundStatuses.Revealable:
        setRoomHeader(roomHeaders.Ready);
        if (interval.current) clearInterval(interval.current);

        break;
      case RoundStatuses.Revealed:
        setRoomHeader(roomHeaders.Revealed + " " + roundScore);
        if (interval.current) clearInterval(interval.current);
        break;
      case RoundStatuses.Revealing:
        let i = revealingDuration / 1000;
        setRoomHeader(roomHeaders.Revealing + " " + i);
        interval.current = setInterval(() => {
          if (i === 0) {
            clearInterval(interval.current);
            return;
          }
          setRoomHeader(roomHeaders.Revealing + " " + --i);
        }, 1000);
        break;
    }
  }, [roundStatus, roundScore]);

  useEffect(() => {
    switch (roundStatus) {
      case RoundStatuses.Started:
        setRoomHeader(roomHeaders.Voting);
      case RoundStatuses.Revealable:
        setRoomHeader(roomHeaders.Ready);
        break;
      case RoundStatuses.Revealed:
        setRoomHeader(roomHeaders.Revealed + " " + roundScore);
        break;
    }
  }, [roundStatus, roundScore]);
  return (
    <div className={styles["room-header"]}>
      <h2>{roomHeader}</h2>
      {revealing && <ProgressBar duration={revealingDuration} />}
    </div>
  );
};
