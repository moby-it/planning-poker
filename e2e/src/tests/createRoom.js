import {
  fillCreateRoomForm,
  navigateToHome,
  submitCreateRoomForm,
} from "../helpers/commands.js";

import { queries, waitFor } from "pptr-testing-library";

const { getByTestId } = queries;

export const createRoom =
  (username, role = "voter") =>
  async (browser) => {
    const { $document, page } = await navigateToHome(browser);
    const startBtn = await getByTestId($document, "start-here");
    await startBtn.click();
    await waitFor(() => getByTestId($document, "create-room"));
    await fillCreateRoomForm($document, username, role);
    await submitCreateRoomForm($document);
    await waitFor(() => getByTestId($document, "room"));
    const roomId = page.url().split("/").pop();
    return roomId;
  };
