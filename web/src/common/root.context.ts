import { Dispatch, createContext, useContext } from "react";


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
};

export function rootReducer(state: RootState, action: RootAction) {
  switch (action.type) {
    case "setRoomId":
      return { ...state, roomId: action.payload };
    case "setUsername":
      return { ...state, username: action.payload };
    case "setIsSpectator":
      return { ...state, isSpectator: !state.isSpectator };
    default:
      return state;
  }
}
export function useIsSpectator() {
  const { isSpectator } = useRootContext();
  return isSpectator;
}
export const rootInitialState = {
  roomId: "",
  username: localStorage.getItem("username") ?? "",
  isSpectator: Boolean(Number(localStorage.getItem(BrowserStorageKeys.isSpectator))),
};
export const RootContext = createContext<RootState>(rootInitialState);
export const RootDispatchContext = createContext<Dispatch<RootAction>>(() => { });

export function useRootContext() {
  return useContext(RootContext);
}
export function useRootDispatch() {
  return useContext(RootDispatchContext);
}