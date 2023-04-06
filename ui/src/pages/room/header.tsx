import { Component, createEffect, createSignal, Show } from "solid-js";
import { ProgressBar } from "../../components/progressBar/progressBar";
import {
  roundStatus,
  RoundStatuses,
  revealingDuration,
  roundScore,
  revealing,
} from "./roomState";
import { Hydration } from "solid-js/web";

const roomHeaders = {
  Voting: "Voting is in session!",
  Ready: "Everyone's Ready",
  Revealing: "Revealing in",
  Revealed: "Average Score",
} as const;

export const RoomHeader: Component = () => {
  let interval: NodeJS.Timer | undefined;
  const [roomHeader, setRoomHeader] = createSignal<string>(roomHeaders.Voting);

  createEffect(() => {
    if (revealing()) {
      let i = revealingDuration() / 1000;
      setRoomHeader(roomHeaders.Revealing + " " + i);
      interval = setInterval(() => {
        if (i === 0) {
          clearInterval(interval);
          return;
        }
        setRoomHeader(roomHeaders.Revealing + " " + --i);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
  });
  createEffect(() => {
    switch (roundStatus()) {
      case RoundStatuses.Started:
        setRoomHeader(roomHeaders.Voting);
      case RoundStatuses.Revealable:
        setRoomHeader(roomHeaders.Ready);
        break;
      case RoundStatuses.Revealed:
        setRoomHeader(roomHeaders.Revealed + " " + roundScore());
        break;
    }
  });
  return (
    <div class="room-header">
      <h2>{roomHeader()}</h2>
      <Show when={roundStatus() === RoundStatuses.Revealing}>
        <ProgressBar duration={revealingDuration()} />
      </Show>
    </div>
  );
};
