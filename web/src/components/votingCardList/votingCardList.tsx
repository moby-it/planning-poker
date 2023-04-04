import { Component, createEffect, createSignal } from "solid-js";
import { VotingCard } from "../card/votingCard";
import "./votingCardList.css";
import { UseRootContext } from "~/common/root.state";
import { useRoomContext } from "~/common/room.state";
export const [selectedCard, setSelectedCard] = createSignal<number | null>(
  null
);

export const VotingCardList: Component = () => {
  const [{ isSpectator }] = UseRootContext();
  const [{ revealed, revealing }] = useRoomContext();
  createEffect((prev) => {
    if (prev && !revealed()) {
      setSelectedCard(null);
    }
    return revealed();
  }, false);
  const canSelectCard = () => !isSpectator() && !revealing() && !revealed();
  const cardValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 1000];
  return (
    <div class="voting-card-list" data-testid="voting-card-list">
      {cardValues.map((v) => (
        <VotingCard
          points={v}
          selected={selectedCard() === v}
          action={() => (canSelectCard() ? setSelectedCard(v) : null)}
        />
      ))}
    </div>
  );
};
