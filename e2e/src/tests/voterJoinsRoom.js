import { getDocument } from "pptr-testing-library";
import {
  FillCreateRoomForm,
  NavigateToRoom,
  SubmitCreateRoomForm,
} from "../helpers/commands.js";
import { createBrowser } from "../helpers/foundation.js";

export const voterJoinsRoom = async (roomId, name) => {
  const browser = await createBrowser();
  let { $document, page } = await NavigateToRoom(browser, roomId);
  await page.waitForTestId('create-room');
  $document = await getDocument(page);
  await FillCreateRoomForm($document, name);
  await SubmitCreateRoomForm($document);
  await page.waitForTestId('voting-card-list');
  return { $document, browser };
};
