const fs = require('node:fs');
const path = require('node:path');

const { app } = require('@react-native-windows/automation');
const smokeStories = require('../scripts/smoke-stories.json');
const { getIndex, selectStory } = require('../scripts/storybook-client.cjs');

const artifactsDirectory = path.join(__dirname, '..', 'artifacts', 'windows', 'automation');

beforeAll(async () => {
  fs.mkdirSync(artifactsDirectory, { recursive: true });
  await getIndex();
});

test.each(smokeStories)('renders $storyId with a stable native selector', async ({ artifactName, storyId, testId }) => {
  await selectStory(storyId);

  const element = await app.findElementByTestID(testId);
  await element.waitForDisplayed({ timeout: 30000 });
  const displayed = await element.isDisplayed();
  expect(displayed).toBe(true);
  fs.writeFileSync(path.join(artifactsDirectory, `${artifactName}.json`), `${JSON.stringify({ storyId, testId, displayed }, null, 2)}\n`);
});
