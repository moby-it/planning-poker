import { Component, Index, Show } from "solid-js";
import "./spectatorList.css";
import { useRoomContext } from "../../pages/room/roomState";
export const SpectatorList: Component = () => {
  const { spectators } = useRoomContext();
  return (
    <div class="spectators">
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
    </div>
  );
};
