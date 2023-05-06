# Poker Planning E2E suite

Instead of testing the ui inside the ui folder, I decided to create a testing suite with puppeteer. The reason is that poker planning is an app that will be used by multiple users and multiple browsers. So in order to avoid mocking as much as I possible I figured that it makes sense to spin up the api and the ui inside docker and do the testing via puppeteer.

The end result incluces a suite with NO mocks. We test pure html interactions with actual data.

### Test with debugging and VS Code

If you want to run the suite with debugging with VS Code you have to do the following:
 
  - Navigate in the root folder of the repo and run `docker compose up -d --build`
  - Navigate inside the `e2e/src` folder and open a Javascript Terminal inside VS Code. After that you can plainly run `node index.js` and attach
  any breakpoints to VSC.