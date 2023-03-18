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
export async function runTest(test, name = test.name) {
  const browser = await launch({
    args: ["--incognito", "--no-sandbox", "--disable-setuid-sandbox"],
    executablePath:'google-chrome-stable'
  });
  let res;
  try {
    res = await test(browser);
    passTest(name);
  } catch (e) {
    failTest(name, e);
  }
  return [res, browser];
}
