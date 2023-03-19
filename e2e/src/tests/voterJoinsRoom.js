import {
  FillCreateRoomForm,
  NavigateToRoom,
  SubmitCreateRoomForm,
} from "../helpers/commands.js";
import { queries, waitFor } from "pptr-testing-library";
import { createBrowser } from "../helpers/foundation.js";

const { getByTestId } = queries;
export const voterJoinsRoom = async (roomId, name) => {
  const browser = await createBrowser();
  const { $document } = await NavigateToRoom(browser, roomId);
  await waitFor(() => getByTestId($document, "create-room"));
  await FillCreateRoomForm($document, name);
  await SubmitCreateRoomForm($document);
  await waitFor(() => getByTestId($document, "voting-card-list"));
  return { $document, browser };
};
