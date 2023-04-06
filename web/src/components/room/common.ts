import { RootState } from "@/common/root.context";
import { wsv1Url } from "../../config";
import { handleWsMessage } from "./roomState";

export async function connectToRoom({ roomId, username, isSpectator }: RootState): Promise<WebSocket> {
  const role = isSpectator ? "spectator" : "voter";
  return new Promise((resolve, reject) => {
    if (!roomId) reject("No room id");
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId}/${username}/${role}`
    );
    socket.addEventListener("open", function () {
      resolve(socket);
    });
    socket.addEventListener("message", handleWsMessage);
    socket.addEventListener("error", () => {
      reject('error from ws connection');
    });
  });
}
export function sendMessageIfOpen(ws: WebSocket | undefined, message: unknown) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}