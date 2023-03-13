import { useNavigate, useSearchParams } from "@solidjs/router";
import { Component } from "solid-js";
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
const PrejoinForm: Component = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams<{ create: string }>();
  const isCreatingRoom = Boolean(params.create);
  const title = isCreatingRoom ? "Create a New Room" : "Joining Room";
  const buttonText = isCreatingRoom ? "create room" : "join room";
  const handleInputChanged = (event: KeyboardEvent) => {
    // @ts-ignore
    const username: string = event?.target?.value;
    setUsername(username);
    sessionStorage.setItem(BrowserStorageKeys.username, username);
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
  return (
    <div class="prejoin-form">
      <h2>{title}</h2>
      <div>
        <label for="username">Username</label>
        <input
          data-testid="username-input"
          type="text"
          name="username"
          onKeyUp={handleInputChanged}
          value={username()}
        />
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
        data-testid="createRoomBtn"
        action={async () =>
          isCreatingRoom ? await createRoom() : navigate(`/room/${roomId()}`)
        }
      >
        <span>{buttonText}</span>
      </Button>
    </div>
  );
};
export default PrejoinForm;
