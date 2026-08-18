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

test.each(smokeStories)('renders $storyId with stable native selectors', async ({ artifactName, statusTestId, storyId, testId }) => {
  await selectStory(storyId);

  const element = await app.findElementByTestID(testId);
  await element.waitForDisplayed({ timeout: 30000 });
  const displayed = await element.isDisplayed();
  expect(displayed).toBe(true);

  let statusText;
  if (statusTestId) {
    const statusElement = await app.findElementByTestID(statusTestId);
    await statusElement.waitForDisplayed({ timeout: 30000 });
    statusText = await statusElement.getText();
    expect(statusText).toBe('Native window: Shown');
  }

  fs.writeFileSync(
    path.join(artifactsDirectory, `${artifactName}.json`),
    `${JSON.stringify({ storyId, testId, displayed, statusTestId, statusText }, null, 2)}\n`,
  );
});
