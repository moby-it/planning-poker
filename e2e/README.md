# Poker Planning E2E suite

Instead of testing the ui inside the ui folder, I decided to create a testing suite with puppeteer. The reason is that poker planning is an app that will be used by multiple users and multiple browsers. So in order to avoid mocking as much as I possible I figured that it makes sense to spin up the api and the ui inside docker and do the testing via puppeteer.

The end result incluces a suite with NO mocks. We test pure html interactions with actual data.