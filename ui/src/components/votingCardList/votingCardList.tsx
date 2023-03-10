import { Component, createEffect, createSignal } from "solid-js";
import { isSpectator } from "../../common/state";
import { revealed, revealing } from "../../pages/room/roomState";
import { VotingCard } from "../card/votingCard";
import "./votingCardList.css";
export const [selectedCard, setSelectedCard] = createSignal<number | null>(
  null
);

export const VotingCardList: Component = () => {
  createEffect((prev) => {
    if (prev && !revealed()) {
      setSelectedCard(null);
    }
    return revealed();
  }, false);
  const cardValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 1000];
  return (
    <div class="voting-card-list">
      {cardValues.map((v) => (
        <VotingCard
          points={v}
          selected={selectedCard() === v}
          action={() => (!isSpectator() && !revealing() ? setSelectedCard(v) : null)}
        />
      ))}
    </div>
  );
};
