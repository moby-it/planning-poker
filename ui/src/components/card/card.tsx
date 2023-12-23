
import { Component, Match, mergeProps, Show, Switch } from "solid-js";
import "./card.css";

export const Card: Component<{
  voted?: boolean;
  points?: number;
  revealed?: boolean;
}> = (_props) => {
  const props = mergeProps({ voted: false, revealed: false }, _props);
  return (
    <div
      classList={{ card: true, voted: props.voted, revealed: props.revealed }}
    >
      <Show when={isNumber(props.points)}>
        <Switch fallback={<span>{props.points}</span>}>
          <Match when={props.points === 100}>
            <span>?</span>
          </Match>
          <Match when={props.points === 1000}>
            <img src="/cup-medium.svg" />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};
function isNumber(v: unknown): v is Number {
  return typeof v === "number";
}
