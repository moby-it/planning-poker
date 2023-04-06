import { Dispatch, createContext, useContext, useEffect, useReducer } from "react";
import { boolean } from "zod";

let userInit = true;
let isSpectatorInit = true;
export const BrowserStorageKeys = {
  username: "username",
  isSpectator: "isSpectator",
};
export interface RootState {
  roomId: string;
  username: string;
  isSpectator: boolean;
}
type RootAction = {
  type: "setRoomId";
  payload: string;
} | {
  type: "setUsername";
  payload: string;
} | {
  type: "setIsSpectator";
  payload?: boolean;
};

function rootReducer(state: RootState, action: RootAction) {
  switch (action.type) {
    case "setRoomId":
      return { ...state, roomId: action.payload };
    case "setUsername":
      return { ...state, username: action.payload };
    case "setIsSpectator":
      return { ...state, isSpectator: typeof action.payload === 'boolean' ? action.payload : !state.isSpectator };
    default:
      return state;
  }
}
export function useIsSpectator() {
  const { isSpectator } = useRootContext();
  const dispatch = useRootDispatch();
  useEffect(() => {
    if (!isSpectatorInit) return;
    isSpectatorInit = false;
    const isSpectator = localStorage.getItem(BrowserStorageKeys.isSpectator) ? Boolean(Number(localStorage.getItem(BrowserStorageKeys.isSpectator))) : false;
    dispatch({ type: "setIsSpectator", payload: isSpectator });
  }, [isSpectator]);
  useEffect(() => {
    localStorage.setItem(BrowserStorageKeys.isSpectator, isSpectator ? "1" : "0");
  }, [isSpectator]);
  return isSpectator;
}
export function useUsername() {
  const { username } = useRootContext();
  const dispatch = useRootDispatch();
  useEffect(() => {
    if (!userInit) return;
    userInit = false;
    const username = localStorage.getItem(BrowserStorageKeys.username);
    if (username) {
      dispatch({ type: "setUsername", payload: username });
    }
  }, [username]);
  useEffect(() => {
    localStorage.setItem(BrowserStorageKeys.username, username);
  }, [username]);
  return username;
}
export function useRoomId() {
  const { roomId } = useRootContext();
  return roomId;
}
export const rootInitialState = {
  roomId: "",
  username: "",
  isSpectator: false,
};
export const RootContext = createContext<RootState>(rootInitialState);
export const RootDispatchContext = createContext<Dispatch<RootAction>>(() => { });

export function useRootContext() {
  return useContext(RootContext);
}
export function useRootDispatch() {
  return useContext(RootDispatchContext);
}
export function RootProvider({ children }: { children: React.ReactNode; }) {
  const [state, dispatch] = useReducer(rootReducer, rootInitialState);
  return (
    <RootContext.Provider value={state}>
      <RootDispatchContext.Provider value={dispatch}>
        {children}
      </RootDispatchContext.Provider>
    </RootContext.Provider>
  );
};