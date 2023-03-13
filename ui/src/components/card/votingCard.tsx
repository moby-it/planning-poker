import { Component, Match, mergeProps, Switch } from "solid-js";
import "./card.css";
export const VotingCard: Component<{
  selected?: boolean;
  points: number;
  action: () => void;
}> = (_props) => {
  const props = mergeProps({ selected: false }, _props);
  return (
    <div
      classList={{ "voting-card": true, selected: props.selected }}
      onClick={props.action}
    >
      <Switch fallback={<span>{props.points}</span>}>
        <Match when={props.points === 100}>
          <span>?</span>
        </Match>
        <Match when={props.points === 1000}>
          <img src="/cup-small.svg" />
        </Match>
      </Switch>
    </div>
  );
};
