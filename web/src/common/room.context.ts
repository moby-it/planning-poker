import { createContext, useContext, useState } from "react";
import { log } from "./analytics";
import { User } from "./user";
import {
  RoundToReveal, isCancelReveal, isPong, isRoundRevealAvailable,
  isRoundRevealed, isRoundStarted, isRoundToReveal, isUserVoted, isUsersUpdated
} from "./ws-events";

export const RoundStatuses = {
  NotStarted: "NotStarted",
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
} as const;
interface RoomState {
  voters: User[];
  spectators: User[];
  roundStatus: string;
  revealingDuration: number;
  roundScore: string | null;
}
export type RoomAction = {
  type: "setVoters";
  payload: User[];
} | {
  type: "setSpectators";
  payload: User[];
} | {
  type: "setRoundStatus";
  payload: string;
} | {
  type: "setRevealingDuration";
  payload: number;
} | {
  type: "setAverageScore";
  payload: number | null;
};
export function RoomReducer(state: RoomState, action: RoomAction) {
  switch (action.type) {
    case "setVoters":
      return { ...state, voters: action.payload };
    case "setSpectators":
      return { ...state, spectators: action.payload };
    case "setRoundStatus":
      return { ...state, roundStatus: action.payload };
    case "setRevealingDuration":
      return { ...state, revealingDuration: action.payload };
    case "setAverageScore":
      return { ...state, roundScore: action.payload?.toFixed(1) };
    default:
      return state;
  }
}
export const roomInitialState = {
  voters: [],
  spectators: [],
  roundStatus: RoundStatuses.NotStarted,
  revealingDuration: 0,
  roundScore: null,
};
export const RoomContext = createContext<RoomState>(roomInitialState);
export const RoomDispatchContext = createContext<React.Dispatch<RoomAction>>(() => { });
export function useRoomContext() {
  return useContext(RoomContext);
}
export function useRoomDispatch() {
  return useContext(RoomDispatchContext);
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
