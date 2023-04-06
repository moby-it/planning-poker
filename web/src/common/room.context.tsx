import React, { Dispatch, createContext, useContext } from "react";
import { log } from "./analytics";
import { User } from "./user";
import {
  isCancelReveal, isPong, isRoundRevealAvailable,
  isRoundRevealed, isRoundStarted, isRoundToReveal, isUserVoted, isUsersUpdated
} from "./ws-events";

export const RoundStatuses = {
  NotStarted: "NotStarted",
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
} as const;
export interface RoomState {
  voters: User[];
  spectators: User[];
  roundStatus: string;
  revealingDuration: number;
  roundScore: string | null | undefined;
}
export type RoomAction =
  {
    type: "setSelectedCard",
    payload: number | null;
  }
  | {
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
  } | {
    type: "setUserVoted";
    payload: User;
  } | {
    type: "setUserVotes";
    payload: Record<string, number>;
  } | {
    type: "resetVotes";

  };
function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "setVoters":
      return { ...state, voters: action.payload };
    case "setUserVoted":
      return {
        ...state,
        voters: state.voters.map((voter) => {
          if (voter.username === action.payload.username) {
            return action.payload;
          }
          return voter;
        }),
      };
    case "setUserVotes":
      return {
        ...state,
        voters: state.voters.map((voter) => {
          voter.points = action.payload[voter.username];
          return voter;
        }),
      };
    case "resetVotes":
      return {
        ...state,
        voters: state.voters.map((voter) => {
          voter.points = undefined;
          voter.voted = false;
          return voter;
        }),
      };
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
export const roomInitialState: RoomState = {
  voters: [],
  spectators: [],
  roundStatus: RoundStatuses.Started,
  revealingDuration: 0,
  roundScore: null,
};
export function useRevealed() {
  const { roundStatus } = useRoomContext();
  return roundStatus === RoundStatuses.Revealed;
}
export function useRevealing() {
  const { roundStatus } = useRoomContext();
  return roundStatus === RoundStatuses.Revealing;
}
export function useRevealable() {
  const { roundStatus } = useRoomContext();
  return roundStatus === RoundStatuses.Revealable;
}
export function useSpectators() {
  const { spectators } = useRoomContext();
  return spectators;
}
export function useRevealignDuration() {
  const { revealingDuration } = useRoomContext();
  return revealingDuration;
}
export const RoomContext = createContext<RoomState>(roomInitialState);
export const RoomDispatchContext = createContext<React.Dispatch<RoomAction>>(() => { });
export function useRoomContext() {
  return useContext(RoomContext);
}
export function useRoomDispatch() {
  return useContext(RoomDispatchContext);
}
export function RoomProvider({ children }: { children: React.ReactNode; }) {
  const [state, dispatch] = React.useReducer(roomReducer, roomInitialState);
  return <RoomContext.Provider value={state}>
    <RoomDispatchContext.Provider value={dispatch}>
      {children}
    </RoomDispatchContext.Provider>
  </RoomContext.Provider>;
}
export const handleWsMessage = (ctx: { state: RoomState, dispatch: Dispatch<RoomAction>; }) => (event: MessageEvent<unknown>) => {
  const state = ctx.state;
  const dispatch = ctx.dispatch;
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
        points: state.voters.find((v) => v.username === u.username)?.points,
      }));
    const s: User[] = data.users
      .filter((u) => !u.isVoter)
      .map((u) => ({
        username: u.username,
        voted: false,
      }));
    dispatch({ type: "setVoters", payload: v });
    dispatch({ type: "setSpectators", payload: s });
  } else if (isRoundRevealAvailable(data)) {
    if (data.revealAvailable)
      dispatch({ type: "setRoundStatus", payload: RoundStatuses.Revealable });
    else
      dispatch({ type: "setRoundStatus", payload: RoundStatuses.Started });
  } else if (isUserVoted(data)) {
    dispatch({ type: "setUserVoted", payload: { username: data.username, voted: true } });
  } else if (isRoundToReveal(data)) {
    dispatch({ type: "setRoundStatus", payload: RoundStatuses.Revealing });
    dispatch({ type: "setRevealingDuration", payload: data.after });
  } else if (isCancelReveal(data)) {
    dispatch({ type: "setRoundStatus", payload: RoundStatuses.Revealable });
  }
  else if (isRoundRevealed(data)) {
    log("round_revealed");
    const averageScore =
      Object.values(data.votes).reduce((a, b) => a + b, 0) /
      Object.values(data.votes).length;
    dispatch({ type: "setRoundStatus", payload: RoundStatuses.Revealed });
    dispatch({ type: "setAverageScore", payload: averageScore });
    dispatch({ type: "setUserVotes", payload: data.votes });
  }
  else if (isRoundStarted(data)) {
    dispatch({ type: "setRoundStatus", payload: RoundStatuses.Started });
    dispatch({ type: "setAverageScore", payload: null });
    dispatch({ type: "resetVotes" });
  } else if (isPong(data)) {
    // ignore
  } else {
    console.error("Unhandled message", data);
  }
};
