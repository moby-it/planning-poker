import {
  fillCreateRoomForm,
  navigateToRoom,
  submitCreateRoomForm,
} from "../helpers/commands.js";
import { queries, waitFor } from "pptr-testing-library";

const { getByTestId } = queries;
export const voterJoinsRoom = (roomId, name) => async (browser) => {
  const { $document } = await navigateToRoom(browser, roomId);
  await waitFor(() => getByTestId($document, "create-room"));
  await fillCreateRoomForm($document, name);
  await submitCreateRoomForm($document);
  await waitFor(() => getByTestId($document, "voting-card-list"));
  return browser;
};
