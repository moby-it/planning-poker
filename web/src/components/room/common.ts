import { RoomAction, RoomState, handleWsMessage } from "@/common/room.context";
import { RootState } from "@/common/root.context";
import { Dispatch } from "react";
import { wsv1Url } from "../../config";

export async function connectToRoom({ state, dispatch }: { state: RootState & RoomState, dispatch: Dispatch<RoomAction>; }): Promise<WebSocket> {
  const role = state.isSpectator ? "spectator" : "voter";
  return new Promise((resolve, reject) => {
    if (!state.roomId) reject("No room id");
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${state.roomId}/${state.username}/${role}`
    );
    socket.addEventListener("open", function () {
      resolve(socket);
    });
    socket.addEventListener("message", handleWsMessage({ state, dispatch }));
    socket.addEventListener("error", () => {
      reject('error from ws connection');
    });
  });
}
export function sendMessageIfOpen(ws: WebSocket | undefined, message: unknown) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}