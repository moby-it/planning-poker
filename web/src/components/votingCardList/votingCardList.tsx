import { useRevealed, useRevealing } from "@/common/room.context";
import { useIsSpectator } from "@/common/root.context";
import { useEffect, useMemo, useRef } from "react";
import { VotingCard } from "../card/votingCard";
import styles from "./votingCardList.module.css";
interface VotingCardProps {
  selectedCard: number | null;
  setSelectedCard: (v: number | null) => void;
}

export const VotingCardList = (props: VotingCardProps) => {
  const revealed = useRevealed();
  const isSpectator = useIsSpectator();
  const revealing = useRevealing();
  const prev = useRef<boolean>();
  const { selectedCard, setSelectedCard } = props;
  const canSelectCard = useMemo(() => !isSpectator && !revealing && !revealed, [revealing, revealed, isSpectator]);
  useEffect(() => {
    if (prev && !revealed) {
      setSelectedCard(null);
    }
    prev.current = revealed;
  }, [revealed]);
  const cardValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 1000];
  return (
    <div className={styles["voting-card-list"]} data-testid="voting-card-list">
      {cardValues.map((v) => (
        <VotingCard
          key={v}
          points={v}
          selected={selectedCard === v}
          action={() => (canSelectCard ? setSelectedCard(v) : null)}
        />
      ))}
    </div>
  );
};
