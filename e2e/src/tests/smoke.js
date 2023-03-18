import { navigateToHome } from "../helpers/commands.js";
import { queries } from "pptr-testing-library";

const { getByTestId } = queries;
export async function smokeTest(browser) {
  const { $document } = await navigateToHome(browser);
  await getByTestId($document, "title");
}
