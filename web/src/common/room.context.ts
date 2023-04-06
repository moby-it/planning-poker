import { useState } from "react";
import { User } from "./user";
import { log } from "./analytics";
import { isUsersUpdated, isRoundRevealAvailable, isUserVoted, isRoundToReveal, RoundToReveal, isCancelReveal, isRoundRevealed, isRoundStarted, isPong } from "./ws-events";

export const RoundStatuses = {
  NotStarted: "NotStarted",
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
} as const;
export function UseRoomState() {
  const [voters, setVoters] = useState<User[]>([]);
  const [spectators, setSpectators] = useState<User[]>([]);
  const [roundStatus, setRoundStatus] = useState<string>(RoundStatuses.Started);
  const [revealingDuration, setRevealingDuration] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const roundScore = averageScore?.toFixed(1);
  const revealed = roundStatus === RoundStatuses.Revealed;
  const revealing = roundStatus === RoundStatuses.Revealing;
  const revealable = roundStatus === RoundStatuses.Revealable;
  return [{
    voters,
    spectators,
    roundStatus,
    revealingDuration,
    roundScore,
    revealed,
    revealing,
    revealable,
  }, {
    setVoters,
    setSpectators,
    setRoundStatus,
    setRevealingDuration,
    setAverageScore,
  }];
}
export function handleWsMessage(event: MessageEvent<unknown>): void {
  const [{ voters }, { setVoters, setSpectators }] = UseRoomState();
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
    if (revealing())
      setRoundStatus(RoundStatuses.Revealable);
  }
  else if (isRoundRevealed(data)) {
    log("round_revealed");
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
  } else if (isPong(data)) {
    // ignore
  } else {
    console.error("Unhandled message", data);
  }
}
