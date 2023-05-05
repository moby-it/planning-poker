import { Component } from "solid-js";
import toast from "solid-toast";
import { isSpectator, setIsSpectator } from "../../common/state";
import { Toggle } from "../../components/toggle/toggle";
import { revealed, revealing } from "./roomState";

export const RoomSubheader: Component = () => {
  return (
    <div class="room-subheader">
      <span
        class="primary cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(location.href);
          toast.success("Link Copied", {
            // icon is of primary color
            iconTheme: { primary: "#7cb7b0" },
          });
        }}
      >
        Copy Invite Link
      </span>
      <div onClick={() => (revealed() || revealing()) && toast.error('Can only change role after a new Round has Started')}>
        <Toggle
          name="isSpectator"
          label="Join as Spectator"
          testId="spectator-toggle"
          disabled={revealed() || revealing()}
          action={() => setIsSpectator((v) => !v)}
          checked={isSpectator()}
        />
      </div>
    </div>
  );
};
