import styles from './room.module.css';
export const RoomSubheader = () => {
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
      {/* <Toggle
        name="isSpectator"
        label="Join as Spectator"
        testId="spectator-toggle"
        disabled={revealing() || revealed()}
        action={() => setIsSpectator((v) => !v)}
        checked={isSpectator()}
      /> */}
    </div>
  );
};
