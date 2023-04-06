import Image from "next/image";
import "./card.css";
interface VotingCardProps {
  selected?: boolean;
  points: number;
  action: () => void;
}
export const VotingCard = (props: VotingCardProps) => {
  const selected = Boolean(props.selected);
  const cssClasses = "votingCard" + (selected ? " selected" : "");
  function renderPoints(points: number) {
    if (points === 100) {
      return <span>?</span>;
    }
    if (points === 1000) {
      return <Image src="/cup-small.svg" alt="cup-small" />;
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