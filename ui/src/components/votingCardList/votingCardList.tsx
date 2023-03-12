import { Component, Index } from "solid-js";
import { VotingCard } from "../card/votingCard";
import "./votingCardList.css";
export const VotingCardList: Component<{
  selectedCard?: number;
}> = (props) => {
  const cardValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 100, 1000];
  return (
    <div class="voting-card-list">
      {cardValues.map((v) => (
        <VotingCard points={v} selected={props.selectedCard === v} />
      ))}
    </div>
  );
};
