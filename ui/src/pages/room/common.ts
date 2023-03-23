import { useNavigate } from "@solidjs/router";
import { roomId, username, isSpectator } from "../../common/state";
import { wsv1Url } from "../../config";
import { handleWsMessage } from "./roomState";

export async function connectToRoom(): Promise<WebSocket> {
  const navigate = useNavigate();
  return new Promise((resolve, reject) => {
    if (!roomId()) reject("No room id");
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId()}/${username()}/${isSpectator() ? "spectator" : "voter"
      }`
    );
    socket.addEventListener("open", function (event) {
      resolve(socket);
    });
    socket.addEventListener("message", handleWsMessage);
    socket.addEventListener("error", (event) => {
      navigate("/");
      reject(event);
    });
  });
}
export function sendMessageIfOpen(ws: WebSocket | undefined, message: unknown) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}