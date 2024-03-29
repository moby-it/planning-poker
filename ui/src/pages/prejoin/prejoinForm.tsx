import { useNavigate, useSearchParams } from "@solidjs/router";
import { Component, createSignal, onMount, Show } from "solid-js";
import {
  BrowserStorageKeys,
  isSpectator,
  roomId,
  setIsSpectator,
  setRoomId,
  setUsername,
  username,
} from "../../common/state";
import { Button } from "../../components/button/button";
import { Toggle } from "../../components/toggle/toggle";
import { apiV1Url } from "../../config";
import "./prejoinForm.css";
import anime from 'animejs/lib/anime.es.js';
import { fade } from "../home/animations";

const PrejoinForm: Component = () => {
  onMount(() => {
    anime(fade('.prejoin-form'));
  });
  const navigate = useNavigate();
  const [params] = useSearchParams<{ create: string; }>();
  const isCreatingRoom = Boolean(params.create);
  const title = isCreatingRoom ? "Create a New Room" : "Joining Room";
  const buttonText = isCreatingRoom ? "create room" : "join room";
  const [usernameError, setUsernameError] = createSignal<string | null>(null);
  const handleInputChanged = (event: KeyboardEvent) => {
    try {
      // @ts-ignore
      const username: string = event?.target?.value;
      if (username.length > 12) {
        setUsernameError("Username must be less than 12 characters");
        return;
      }
      setUsernameError(null);
      setUsername(username);
      sessionStorage.setItem(BrowserStorageKeys.username, username);
    } catch (e) {
      console.error(e);
    }
  };
  async function createRoom() {
    const createRoomUrl = apiV1Url + "/createRoom";
    const response = await fetch(createRoomUrl, {
      method: "POST",
    });
    const data = await response.text();
    setRoomId(data);
    navigate(`/room/${roomId()}`);
  }
  async function handleSubmit(e: Event) {
    e.preventDefault();
    isCreatingRoom ? await createRoom() : navigate(`/room/${roomId()}`);
  }
  return (
    <form onSubmit={handleSubmit} class="prejoin-form" style="opacity:0;">
      <h2>{title}</h2>
      <div class="input-wrapper">
        <label for="username">Username</label>
        <input
          data-testid="username-input"
          type="text"
          name="username"
          onKeyUp={handleInputChanged}
          value={username()}
        />
        <Show when={usernameError()}>
          <span class="error">{usernameError()}</span>
        </Show>
      </div>
      <div class="is-spectator">
        <div class="is-spectator-switch">
          <Toggle
            name="isSpectator"
            checked={isSpectator()}
            label="Join as Spectator"
            action={() => setIsSpectator((v) => !v)}
          ></Toggle>
        </div>
        <span id="change-later">You can change this later</span>
      </div>
      <Button
        options={{ type: 'submit', color: 'primary' }}
        testId="create-room"
        disabled={!!usernameError()}
      >
        <span>{buttonText}</span>
      </Button>
    </form>
  );
};
export default PrejoinForm;
