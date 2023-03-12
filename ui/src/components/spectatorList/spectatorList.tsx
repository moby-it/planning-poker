import { Accessor, Component, Index } from "solid-js";
import "./spectatorList.css";
export const SpectactorList: Component<{ spectators: Accessor<string[]> }> = (
  props
) => {
  return (
    <>
      <ul class="spectators">
        <li>Spectators</li>
        <Index each={props.spectators()}>
          {(spectator) => <li>{spectator()}</li>}
        </Index>
      </ul>
    </>
  );
};
