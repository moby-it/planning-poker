import { Component, Match, Switch } from "solid-js";
import { Button } from "../../components/button/button";
import { cancelReveal, sendMessageIfOpen } from "./common";
import { useRoomContext } from "./roomState";

export const SubmitBtn: Component<{ socket: WebSocket | undefined; }> = (
  props
) => {
  const { revealable, revealed, revealing } = useRoomContext();
  const toRevealRound = () =>
    sendMessageIfOpen(props.socket, {
      type: "roundToReveal",
    });

  const startNewRound = () =>
    sendMessageIfOpen(props.socket, {
      type: "roundToStart",
    });
  return (
    <Switch>
      <Match when={revealable()}>
        <Button action={toRevealRound} testId="reveal-round">
          <span>Reveal Cards</span>
        </Button>
      </Match>
      <Match when={revealed()}>
        <Button action={startNewRound} testId="start-new-round">
          <span>Start New Round</span>
        </Button>
      </Match>
      <Match when={revealing()}>
        <Button
          options={{ color: "default" }}
          action={cancelReveal(props.socket)}
          testId="cancel-reveal"
        >
          <span>Cancel Reveal</span>
        </Button>
      </Match>
    </Switch>
  );
};
