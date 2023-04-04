import { wsv1Url } from "../../config";
import { useRoomContext } from "../../common/room.state";
import { UseRootContext } from "~/common/root.state";

export async function connectToRoom(): Promise<WebSocket> {
  const [{ roomId, username, role }] = UseRootContext();
  const [, { handleWsMessage }] = useRoomContext();
  return new Promise((resolve, reject) => {
    if (!roomId()) reject("No room id");
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId()}/${username()}/${role()}`
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