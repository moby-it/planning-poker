import { Component, For } from "solid-js";
import { User } from "../../common/user";
import { Card } from "../card/card";
import "./board.css";
import { useRoomContext } from "~/common/room.state";
export const Board: Component<{ users: User[]; }> = (props) => {
  const [{ revealed }] = useRoomContext();
  return (
    <div class="board">
      <For each={props.users}>
        {(user) => (
          <div class="vote">
            <Card
              points={user.points}
              voted={user.voted}
              data-testid={`board-card-${user.username}`}
              revealed={revealed()}
            />
            <span class="username">{user.username}</span>
          </div>
        )}
      </For>
    </div>
  );
};
