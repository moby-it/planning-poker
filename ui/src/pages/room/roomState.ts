import { batch, createEffect, createSignal, on } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { username } from "../../common/state";
import { User } from "../../common/user";
import {
  isRoundRevealAvailable,
  isRoundRevealed,
  isRoundStarted,
  isUsersUpdated,
  isUserVoted,
  RoundRevealed,
} from "../../common/ws-events";
import { ProgressBarDefaultDuration } from "../../components/progressBar/progressBar";
export const RoundStatuses = {
  NotStarted: "NotStarted",
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
} as const;
export const [voters, setVoters] = createStore<User[]>([]);
export const [spectators, setSpectators] = createStore<User[]>([]);
export const [roundStatus, setRoundStatus] = createSignal<string>(RoundStatuses.Started);
export const revealed = () => roundStatus() === RoundStatuses.Revealed;
export const revealing = () => roundStatus() === RoundStatuses.Revealing;
export const revealable = () => roundStatus() === RoundStatuses.Revealable;
export function cancelTimeout() {
  const t = timeout();
  if (t) {
    clearTimeout(t);
    batch(() => {
      setRoundStatus(RoundStatuses.Revealable);
      setTimeoutFn(null);
    });
  }
}
const [timeout, setTimeoutFn] = createSignal<NodeJS.Timeout | null>(null);

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
    if (data.revealAvailable)
      setRoundStatus(RoundStatuses.Revealable);
  } else if (isUserVoted(data)) {
    setVoters(
      (voter) => voter.username === data.username,
      produce((voter) => {
        voter.voted = true;
      })
    );
  } else if (isRoundRevealed(data)) {
    setRoundStatus(RoundStatuses.Revealing);
    ((data: RoundRevealed) => {
      setTimeoutFn(setTimeout(() => {
        const averageScore =
          Object.values(data.votes).reduce((a, b) => a + b, 0) /
          Object.values(data.votes).length;
        batch(() => {
          setAverageScore(averageScore);
          setRoundStatus(RoundStatuses.Revealed);
          setVoters(
            produce((voters) =>
              voters.map((voter) => {
                voter.points = data.votes[voter.username];
                return voter;
              })
            )
          );
        });
      }, ProgressBarDefaultDuration));
    })(data);

  } else if (isRoundStarted(data)) {
    batch(() => {
      setRoundStatus(RoundStatuses.Started);
      setVoters(voters.map((v) => ({ ...v, voted: false, points: undefined })));
      setAverageScore(null);
    });
  } else {
    console.error("Unhandled message", data);
  }
}
