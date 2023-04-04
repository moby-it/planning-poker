import { Component, Match, Switch } from "solid-js";
import { Button } from "../../components/button/button";
import { sendMessageIfOpen } from "./common";
import { useRoomContext } from "~/common/room.state";

export const SubmitBtn: Component<{ socket: WebSocket | undefined; }> = (
  props
) => {
  const [{ revealable, revealed, revealing }] = useRoomContext();
  const toRevealRound = () =>
    sendMessageIfOpen(props.socket, {
      type: "roundToReveal",
    });

  const cancelReveal = () =>
    sendMessageIfOpen(props.socket, {
      type: "cancelReveal",
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
          color="default"
          action={() => cancelReveal()}
          testId="cancel-reveal"
        >
          <span>Cancel Reveal</span>
        </Button>
      </Match>
    </Switch>
  );
};
