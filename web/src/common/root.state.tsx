import { Accessor, JSX, Setter, createContext, createEffect, createSignal, useContext } from "solid-js";
export const BrowserStorageKeys = {
  username: "username",
  isSpectator: "isSpectator",
};
type RootState = [{ roomId: Accessor<string>, username: Accessor<string>, isSpectator: Accessor<boolean>; role: Accessor<string>; }, { setRoomId: Setter<string>; setIsSpectator: Setter<boolean>; setUsername: Setter<string>; }];
export const RootContext = createContext<RootState>();
function validateUsername(username: string | null) {
  if (!username) return "";
  return username.length <= 12 ? username : "";
}
export function RootProvider(props: { username: string | null, isSpectator: boolean; children: JSX.Element; }) {
  const [roomId, setRoomId] = createSignal("");
  const [isSpectator, setIsSpectator] = createSignal(props.isSpectator);
  const [username, setUsername] = createSignal(validateUsername(props.username));
  const role: Accessor<string> = () => (isSpectator() ? "spectator" : "voter");
  createEffect(() => {
    localStorage.setItem("username", username());
  });
  createEffect(() => {
    localStorage.setItem("isSpectator", isSpectator() ? "1" : "0");
  });
  const state: RootState = [
    { roomId, isSpectator, username, role },
    {
      setRoomId,
      setIsSpectator,
      setUsername,
    }
  ];
  return (
    <RootContext.Provider value={state} >
      {props.children}
    </ RootContext.Provider>
  );
}
export function UseRootContext() {
  return useContext(RootContext) as RootState;
}