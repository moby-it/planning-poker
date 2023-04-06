import { useRevealable, useRevealed, useRevealing } from "@/common/room.context";
import { Button } from "../../components/button/button";
import { sendMessageIfOpen } from "./common";

interface SubmitBtnProps {
  socket: WebSocket | undefined;
}

export const SubmitBtn = (
  props: SubmitBtnProps
) => {
  const revealable = useRevealable();
  const revealed = useRevealed();
  const revealing = useRevealing();
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
  function renderButton() {
    if (revealable) {
      return (
        <Button action={toRevealRound} testId="reveal-round">
          <span>Reveal Cards</span>
        </Button>
      );
    } else if (revealed) {
      return (
        <Button action={startNewRound} testId="start-new-round">
          <span>Start New Round</span>
        </Button>
      );
    } else if (revealing) {
      return (
        <Button
          color="default"
          action={() => cancelReveal()}
          testId="cancel-reveal"
        >
          <span>Cancel Reveal</span>
        </Button>
      );

    } else {
     return <></>
    }
  }
  return (
    renderButton()
  );
};
