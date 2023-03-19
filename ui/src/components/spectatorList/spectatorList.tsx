import { Component, Index, Show } from "solid-js";
import { spectators } from "../../pages/room/roomState";
import "./spectatorList.css";
export const SpectatorList: Component = () => {
  return (
    <Show when={spectators.length}>
      <ul class="spectators">
        <li>Spectators</li>
        <Index each={spectators}>
          {(spectator) => (
            <li data-testid={"spectator-" + spectator().username}>
              {spectator().username}
            </li>
          )}
        </Index>
      </ul>
    </Show>
  );
};
