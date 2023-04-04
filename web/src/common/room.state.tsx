import { Accessor, JSX, batch, createContext, createSignal, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { log } from "./analytics";
import { User } from "./user";
import {
  isCancelReveal,
  isPong,
  isRoundRevealAvailable,
  isRoundRevealed,
  isRoundStarted,
  isRoundToReveal,
  isUsersUpdated,
  isUserVoted,
  RoundToReveal
} from "./ws-events";
export const RoundStatuses = {
  NotStarted: "NotStarted",
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
} as const;
export type RoomState = [
  {
    voters: User[], spectators: User[], roundStatus: Accessor<string>; revealingDuration: Accessor<number>;
    revealed: Accessor<boolean>, revealing: Accessor<boolean>, revealable: Accessor<boolean>; roundScore: Accessor<string | undefined>;
  },
  { handleWsMessage(event: MessageEvent<unknown>): void; }
];
const RoomContext = createContext<RoomState>();
export function RoomProvider(props: { children: JSX.Element; }) {
  const [voters, setVoters] = createStore<User[]>([]);
  const [spectators, setSpectators] = createStore<User[]>([]);
  const [roundStatus, setRoundStatus] = createSignal<string>(RoundStatuses.Started);
  const [revealingDuration, setRevealingDuration] = createSignal<number>(0);
  const revealed = () => roundStatus() === RoundStatuses.Revealed;
  const revealing = () => roundStatus() === RoundStatuses.Revealing;
  const revealable = () => roundStatus() === RoundStatuses.Revealable;

  const [averageScore, setAverageScore] = createSignal<number | null>(
    null
  );
  const roundScore = () => averageScore()?.toFixed(1);
  const room: RoomState = [
    { voters, spectators, roundStatus, revealingDuration, revealed, revealing, revealable, roundScore },
    {
      handleWsMessage(event: MessageEvent<unknown>): void {
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
    }
  ];
  return (<RoomContext.Provider value={room}>{props.children}</RoomContext.Provider>);
}

export function useRoomContext() {
  return useContext(RoomContext) as RoomState;
}