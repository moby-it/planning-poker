import Image from "next/image";
import styles from "./card.module.css";
import cupSmallWhite from "/public/cup-small-white.svg";
import cupSmallBlack from "/public/cup-small-black.svg";
interface VotingCardProps {
  selected?: boolean;
  points: number;
  action: () => void;
}
export const VotingCard = (props: VotingCardProps) => {
  const selected = Boolean(props.selected);
  const cssClasses = styles.votingCard + (selected ? ` ${styles.selected}` : "");
  function renderPoints(points: number) {
    if (points === 100) {
      return <span>?</span>;
    }
    if (points === 1000) {
      return <Image src={selected ? cupSmallWhite :cupSmallBlack } alt="cup-small" />;
    }
    return <span>{points}</span>;
  }
  return (
    <div
      className={cssClasses}
      data-testid={`votingCard-${props.points}`}
      onClick={props.action}
    >
      {renderPoints(props.points)}
    </div>
  );
};