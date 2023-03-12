import { Component, For } from "solid-js";
import { User } from "../../common/user";
import { Card } from "../card/card";
import "./board.css";
export const Board: Component<{ users: User[] }> = (props) => {
  return (
    <div class="board">
      <For each={props.users}>
        {(user) => (
          <div class="vote">
            <Card points={user.points} voted={user.voted} />
            <span>{user.username}</span>
          </div>
        )}
      </For>
    </div>
  );
};
