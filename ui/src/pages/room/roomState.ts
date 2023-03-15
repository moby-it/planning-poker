import { batch, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { username } from "../../common/state";
import { User } from "../../common/user";
import {
  isCancelReveal,
  isRoundRevealAvailable,
  isRoundRevealed,
  isRoundStarted,
  isRoundToReveal,
  isUsersUpdated,
  isUserVoted,
  RoundToReveal
} from "../../common/ws-events";
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

const [revealingDuration, setRevealingDuration] = createSignal<number>(0);
export { revealingDuration };
export const revealed = () => roundStatus() === RoundStatuses.Revealed;
export const revealing = () => roundStatus() === RoundStatuses.Revealing;
export const revealable = () => roundStatus() === RoundStatuses.Revealable;

const [averageScore, setAverageScore] = createSignal<number | null>(
  null
);
export const roundScore = () => averageScore()?.toFixed(1);
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
    const v = data.users
      .filter((u) => u.isVoter)
      .map((u) => ({
        username: u.username,
        voted: u.hasVoted,
        points: voters.find((v) => v.username === u.username)?.points,
      }));
    const s: User[] = data.users
      .filter((u) => !u.isVoter)
      .map((u) => ({
        username: u.username,
        voted: false,
      }));
    setVoters(v);
    setSpectators(s);
  } else if (isRoundRevealAvailable(data)) {
    if (data.revealAvailable)
      setRoundStatus(RoundStatuses.Revealable);
    else setRoundStatus(RoundStatuses.Started);
  } else if (isUserVoted(data)) {
    setVoters(
      (voter) => voter.username === data.username,
      produce((voter) => {
        voter.voted = true;
      })
    );
  } else if (isRoundToReveal(data)) {
    ((data: RoundToReveal) => {
      batch(() => {
        setRevealingDuration(data.after);
        setRoundStatus(RoundStatuses.Revealing);
      });
    })(data);
  } else if (isCancelReveal(data)) {
    setRoundStatus(RoundStatuses.Revealable);
  }
  else if (isRoundRevealed(data)) {
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
  }
  else if (isRoundStarted(data)) {
    batch(() => {
      setRoundStatus(RoundStatuses.Started);
      setVoters(voters.map((v) => ({ ...v, voted: false, points: undefined })));
      setAverageScore(null);
    });
  } else {
    console.error("Unhandled message", data);
  }
}
