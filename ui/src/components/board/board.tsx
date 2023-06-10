import { Component, For } from "solid-js";
import { User } from "../../common/user";
import { Card } from "../card/card";
import "./board.css";
import { useRoomContext } from "../../pages/room/roomState";
export const Board: Component<{ users: User[]; }> = (props) => {
  const { revealed } = useRoomContext();
  return (
    <div class="board">
      <For each={props.users}>
        {(user) => (
          <div class="vote" data-testid={`board-card-${user.username}`}>
            <Card
              points={user.points}
              voted={user.voted}
              revealed={revealed()}
            />
            <span class="username">{user.username}</span>
          </div>
        )}
      </For>
    </div>
  );
};
