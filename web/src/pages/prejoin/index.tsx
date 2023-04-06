import { RootContext, RootDispatchContext, useUsername } from "@/common/root.context";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { Button } from "../../components/button/button";
import { Toggle } from "../../components/toggle/toggle";
import { apiV1Url } from "../../config";
import styles from "./index.module.css";
const PrejoinForm = () => {
  const router = useRouter();
  const { isSpectator, roomId } = useContext(RootContext);
  const username = useUsername();
  const dispatch = useContext(RootDispatchContext);
  const { create } = router.query;
  const isCreatingRoom = Boolean(create);
  const title = isCreatingRoom ? "Create a New Room" : "Joining Room";
  const buttonText = isCreatingRoom ? "create room" : "join room";
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const handleInputChanged = (event: unknown) => {
    try {
      // @ts-ignore
      const username: string = event?.target?.value;
      if (username.length > 12) {
        setUsernameError("Username must be less than 12 characters");
        return;
      }
      setUsernameError(null);
      dispatch({ type: 'setUsername', payload: username });
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
    console.log(data);
    dispatch({ type: 'setRoomId', payload: data });
    router.replace(`/room/${data}`);
  }
  return (
    <div className={styles.prejoinForm}>
      <h2>{title}</h2>
      <div className={styles.inputWrapper}>
        <label htmlFor="username">Username</label>
        <input
          data-testid="username-input"
          type="text"
          name="username"
          onKeyUp={handleInputChanged}
          onChange={handleInputChanged}
          value={username}
        />
        {usernameError && (
          <span className={styles.error}>{usernameError}</span>
        )}
      </div>
      <div className={styles.isSpectator}>
        <div className={styles.isSpectatorSwitch}>
          <Toggle
            name="isSpectator"
            checked={isSpectator}
            label="Join as Spectator"
            action={() => dispatch({ type: 'setIsSpectator' })}
          ></Toggle>
        </div>
        <span id={styles["change-later"]}>You can change this later</span>
      </div>
      <Button
        testId="create-room"
        disabled={!!usernameError}
        action={async () =>
          isCreatingRoom ? await createRoom() : router.push(`/room/${roomId}`)
        }
      >
        <span>{buttonText}</span>
      </Button>
    </div >
  );
};
export default PrejoinForm;
