import {
  FillCreateRoomForm,
  NavigateToHome,
  SubmitCreateRoomForm,
} from "../helpers/commands.js";

import { queries, waitFor } from "pptr-testing-library";
import { createBrowser } from "../helpers/foundation.js";

const { getByTestId } = queries;

export const createRoom = async (username, role = "voter") => {
  const browser = await createBrowser();
  const { $document, page } = await NavigateToHome(browser);
  const startBtn = await getByTestId($document, "start-here");
  await startBtn.click();
  await waitFor(() => getByTestId($document, "create-room"));
  await FillCreateRoomForm($document, username, role);
  await SubmitCreateRoomForm($document);
  await waitFor(() => getByTestId($document, "room"));
  const roomId = page.url().split("/").pop();
  return [roomId, { $document, browser }];
};
