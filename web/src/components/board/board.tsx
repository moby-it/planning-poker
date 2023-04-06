import { Component, For } from "solid-js";
import { User } from "../../common/user";
import { revealed } from "../../pages/room/roomState";
import { Card } from "../card/card";
export const Board: Component<{ users: User[] }> = (props) => {
  return (
    <div className="board">
      <For each={props.users}>
        {(user) => (
          <div className="vote">
            <Card
              points={user.points}
              voted={user.voted}
              data-testid={`board-card-${user.username}`}
              revealed={revealed()}
            />
            <span className="username">{user.username}</span>
          </div>
        )}
      </For>
    </div>
  );
};
