import { role, roomId, username } from "../../common/state";
import { wsv1Url } from "../../config";

type WsEventHandler = (event: MessageEvent<unknown>) => void;

export async function connectToRoom(hander: WsEventHandler): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    if (!roomId()) reject("No room id");
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId()}/${username()}/${role()}`
    );
    socket.addEventListener("open", function () {
      resolve(socket);
    });
    socket.addEventListener("message", hander);
    socket.addEventListener("error", () => {
      reject('error from ws connection');
    });
  });
}
export function sendMessageIfOpen(ws: WebSocket | undefined, message: unknown) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}
export function cancelReveal(socket: WebSocket | undefined) {
  return () => sendMessageIfOpen(socket, {
    type: "cancelReveal",
  });
}

