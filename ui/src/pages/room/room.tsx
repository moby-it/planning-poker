import { useNavigate, useParams } from "@solidjs/router";
import { Component, createResource, createSignal, Show } from "solid-js";
import { roomId, SessionStorageKeys, setRoomId, wsv1Url } from "../../config";

const Room: Component = () => {
  const [storyPoints, setStoryPoints] = createSignal(0);
  const navigate = useNavigate();
  const params = useParams();
  const roomId = params["roomId"];
  setRoomId(roomId);
  const username =
    params["username"] ?? sessionStorage.getItem(SessionStorageKeys.username);
  if (!username) {
    navigate("/prejoin");
    return;
  }
  const [socket] = createResource(() => connectToRoom({ username }));
  const handleStoryPointsChanged = (event: KeyboardEvent) => {
    if (
      event.target &&
      "value" in event.target &&
      typeof event.target.value === "string"
    ) {
      setStoryPoints(+event?.target.value);
    }
  };
  function userVotes() {
    const ws = socket();
    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "userToVote",
        username: username,
        storyPoints: storyPoints(),
        roomId,
      })
    );
  }

  function revealRound() {
    const ws = socket();

    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    ws.send(
      JSON.stringify({
        type: "roundToReveal",
      })
    );
  }
  function startNewRound() {
    const ws = socket();

    if (socket.loading || socket.error || !ws) {
      throw new Error("No socket connection");
    }
    setStoryPoints(0);
    ws.send(
      JSON.stringify({
        type: "roundToStart",
      })
    );
  }

  return (
    <Show
      when={!socket.loading}
      fallback={<p data-testid="loading">loading</p>}
    >
      <div
        style="display:flex; flex-direction:column; gap:14px;align-items:flex-start; padding:24px;"
        data-testid="room"
      >
        <input
          type="number"
          onKeyUp={handleStoryPointsChanged}
          value={storyPoints()}
        />
        <button onClick={userVotes}>User Votes</button>
        <button onClick={revealRound}>Reveal Round</button>
        <button onClick={startNewRound}>Start New Round</button>
      </div>
    </Show>
  );
};
async function connectToRoom({
  username,
}: {
  username: string;
}): Promise<WebSocket> {
  const navigate = useNavigate();
  return new Promise((resolve, reject) => {
    console.log("user", username, "should connect to room", roomId());
    const socket = new WebSocket(
      `${wsv1Url}/joinRoom/${roomId()}/${username}/voter`
    );
    socket.addEventListener("open", function (event) {
      console.log("connected", event);
      resolve(socket);
    });
    socket.addEventListener("message", (event) => {
      console.log("Message from server ", JSON.parse(event.data));
    });
    socket.addEventListener("error", (event) => {
      console.log("Error from server ", event);
      navigate("/");
      reject(event);
    });
  });
}
export default Room;
