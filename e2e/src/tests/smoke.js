import { NavigateToHome } from "../helpers/commands.js";
import { queries } from "pptr-testing-library";
import { createBrowser } from "../helpers/foundation.js";

const { getByTestId } = queries;
export async function smokeTest() {
  const browser = await createBrowser();
  const { $document } = await NavigateToHome(browser);
  await getByTestId($document, "title");
  return [null, { $document, browser }];
}
