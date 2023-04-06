import { useSpectators } from "@/common/room.context";
import styles from "./spectatorList.module.css";

export const SpectatorList = () => {
  const spectators = useSpectators();
  return (
    <div className={styles.spectators}>
      {spectators.length !== 0 && (
        <ul className={styles.spectators}>
          <li>Spectators</li>
          {spectators.map((spectator) => (
            <li
              key={spectator.username}
              data-testid={"spectator-" + spectator.username}
            >
              {spectator.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
