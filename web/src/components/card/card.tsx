import styles from "./card.module.css";
import Image from "next/image";
interface CardProps {
  voted?: boolean;
  points?: number;
  revealed?: boolean;
}

export const Card = (props: CardProps) => {
  const points = props.points;
  const revealed = Boolean(props.revealed);
  const voted = Boolean(props.voted);
  const cssClasses = styles.card + (voted ? ` ${styles.voted}` : "") + (revealed ? ` ${styles.revealed}` : "");
  function renderPoints(points: unknown) {
    if (typeof points === "number") {
      if (points === 100) {
        return <span>?</span>;
      }
      if (points === 1000) {
        return <Image src="/cup-medium.svg" alt="cup-medium" />;
      }
      return <span>{points}</span>;
    }
    return null;
  }
  return (
    <div
      className={cssClasses}    >
      {renderPoints(points)}
    </div>
  );
};
