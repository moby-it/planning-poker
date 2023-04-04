import { Component } from "solid-js";
import toast from "solid-toast";
import { Toggle } from "../../components/toggle/toggle";
import { UseRootContext } from "~/common/root.state";
import { useRoomContext } from "~/common/room.state";

export const RoomSubheader: Component = () => {
  const [{ isSpectator }, { setIsSpectator }] = UseRootContext();
  const [{ revealed, revealing }] = useRoomContext();
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
      <Toggle
        name="isSpectator"
        label="Join as Spectator"
        testId="spectator-toggle"
        disabled={revealing() || revealed()}
        action={() => setIsSpectator((v) => !v)}
        checked={isSpectator()}
      />
    </div>
  );
};
