import { useRevealed } from "@/common/room.context";
import { User } from "../../common/user";
import { Card } from "../card/card";
import styles from "./board.module.css";
interface BoardProps {
  users: User[];
}
export const Board = (props: BoardProps) => {
  const revealed = useRevealed();
  return (
    <div className={styles.board}>
      {props.users.map(user => (
        <div className={styles.vote} key={user.username}>
          <Card
            points={user.points}
            voted={user.voted}
            data-testid={`board-card-${user.username}`}
            revealed={revealed}
          />
          <span className={styles.username}>{user.username}</span>
        </div>
      ))}
    </div>
  );
};
