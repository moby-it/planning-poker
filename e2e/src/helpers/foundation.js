import { launch } from "puppeteer";
/**
 *
 * @param {string} testName
 */
function passTest(testName) {
  console.log(`${testName}: `, "\u2713");
}
/**
 *
 * @param {string} testName
 * @param {Error} e
 */
function failTest(testName, e) {
  console.log(`${testName}: `, "\u2717");
  throw e;
}
/**
 *
 * @param {(browser:import('puppeteer').Browser)=>Promise<void>} test
 */
export async function runTest(name, test) {
  let res;
  try {
    res = await test();
    passTest(name);
  } catch (e) {
    failTest(name, e);
  }
  return res;
}
export async function createBrowser() {
  return await launch({
    args: ["--incognito", "--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "google-chrome-stable",
  });
}
/**
 * 
 * @param {(browser:import('puppeteer').Page)} page 
 */
export function debugPage(page) {
  page
    .on('console', message =>
      console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`));
}