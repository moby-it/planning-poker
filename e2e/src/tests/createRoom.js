import {
  FillCreateRoomForm,
  NavigateToHome,
  SubmitCreateRoomForm
} from "../helpers/commands.js";

import { getDocument, queries } from "pptr-testing-library";
import { createBrowser } from "../helpers/foundation.js";

const { getByTestId } = queries;

export const createRoom = async (username, role = "voter") => {
  const browser = await createBrowser();
  let { $document, page } = await NavigateToHome(browser);
  const startBtn = await getByTestId($document, "start-here");
  await startBtn.click();
  await page.waitForTestId('create-room');
  $document = await getDocument(page);
  await FillCreateRoomForm($document, username, role);
  await SubmitCreateRoomForm($document);
  await page.waitForTestId('room');
  const roomId = page.url().split("/").pop();
  return [roomId, { $document, browser }];
};
