import { useRevealed, useRevealing, useRoomContext, useRoomDispatch } from '@/common/room.context';
import { Toggle } from '../toggle/toggle';
import styles from './room.module.css';
import { useIsSpectator } from '@/common/root.context';
import { useRootDispatch } from '@/common/root.context';
export const RoomSubheader = () => {
  const isSpectator = useIsSpectator();
  const revealing = useRevealing();
  const revealed = useRevealed();
  const dispatch = useRootDispatch();
  return (
    <div className={styles["room-subheader"]}>
      <span
        className="primary cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(location.href);
          // toast.success("Link Copied", {
          //   // icon is of primary color
          //   iconTheme: { primary: "#7cb7b0" },
          // });
        }}
      >
        Copy Invite Link
      </span>
      <Toggle
        name="isSpectator"
        label="Join as Spectator"
        testId="spectator-toggle"
        disabled={revealing || revealed}
        action={() => dispatch({ type: 'setIsSpectator' })}
        checked={isSpectator}
      />
    </div>
  );
};
