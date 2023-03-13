import { createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { username } from "../../common/state";
import { User } from "../../common/user";
import {
  isRoundRevealAvailable,
  isRoundRevealed,
  isRoundStarted,
  isUsersUpdated,
  isUserVoted,
} from "../../common/ws-events";
import { ProgressBarDefaultDuration } from "../../components/progressBar/progressBar";
export const [voters, setVoters] = createStore<User[]>([]);
export const [spectators, setSpectators] = createStore<User[]>([]);
export const [reavalable, setRevealable] = createSignal(false);
export const [revealing, setRevealing] = createSignal(false);
export const [revealed, setRevealed] = createSignal(false);
export const [averageScore, setAverageScore] = createSignal<number | null>(
  null
);
export function addPointsVoter(points: number) {
  setVoters(
    (voter) => voter.username === username(),
    produce((voter) => {
      voter.points = points;
    })
  );
}
export function handleWsMessage(event: MessageEvent<unknown>): void {
  let data: any = event.data;
  try {
    data = JSON.parse(data as string);
  } catch (e) {
    console.error(e);
  }
  if (isUsersUpdated(data)) {
    const voters = data.users
      .filter((u) => u.isVoter)
      .map((u) => ({
        username: u.username,
        voted: u.hasVoted,
      }));
    const spectators = data.users
      .filter((u) => !u.isVoter)
      .map((u) => ({
        username: u.username,
        voted: false,
      }));
    setVoters(voters);
    setSpectators(spectators);
  } else if (isRoundRevealAvailable(data)) {
    setRevealable(data.revealAvailable);
  } else if (isUserVoted(data)) {
    setVoters(
      (voter) => voter.username === data.username,
      produce((voter) => {
        voter.voted = true;
      })
    );
  } else if (isRoundRevealed(data)) {
    setRevealing(true);
    setTimeout(() => {
      setVoters(
        produce((voters) =>
          voters.map((voter) => {
            voter.points = data.votes[voter.username];
            return voter;
          })
        )
      );
      const averageScore =
        // @ts-ignore
        Object.values(data.votes).reduce((a, b) => a + b, 0) /
        Object.values(data.votes).length;
      setAverageScore(averageScore);
      setRevealed(true);
      setRevealing(false);
    }, ProgressBarDefaultDuration);
  } else if (isRoundStarted(data)) {
    setRevealed(false);
    setRevealable(false);
    setVoters(voters.map((v) => ({ ...v, voted: false, points: undefined })));
    setAverageScore(null);
  } else {
    console.log("Unhandled message", data);
  }
}
