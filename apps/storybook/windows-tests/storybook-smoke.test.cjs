const fs = require('node:fs');
const path = require('node:path');

const { app } = require('@react-native-windows/automation');
const smokeStories = require('../scripts/smoke-stories.json');
const { getIndex, selectStory } = require('../scripts/storybook-client.cjs');

const artifactsDirectory = path.join(__dirname, '..', 'artifacts', 'windows', 'automation');
const arrowRight = '\uE014';
const arrowDown = '\uE015';
const tab = '\uE004';

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

test('FocusZone performs geometric two-dimensional navigation', async () => {
  await selectStory('primitives-focuszone--two-dimensional-navigation');

  const firstItem = await app.findElementByTestID('focus-zone-item-1');
  const fourthItem = await app.findElementByTestID('focus-zone-item-4');
  await firstItem.click();
  expect(await firstItem.getAttribute('HasKeyboardFocus')).toBe('True');

  await firstItem.sendKeys([arrowDown]);
  expect(await fourthItem.getAttribute('HasKeyboardFocus')).toBe('True');
});

test('FocusZone performs linear navigation and exits on Tab', async () => {
  await selectStory('primitives-focuszone--default');

  const firstItem = await app.findElementByTestID('focus-zone-item-1');
  const secondItem = await app.findElementByTestID('focus-zone-item-2');
  const thirdItem = await app.findElementByTestID('focus-zone-item-3');
  const afterZone = await app.findElementByTestID('focus-zone-after');
  await firstItem.click();

  await firstItem.sendKeys([arrowRight]);
  expect(await secondItem.getAttribute('HasKeyboardFocus')).toBe('True');
  await secondItem.sendKeys([arrowDown]);
  expect(await thirdItem.getAttribute('HasKeyboardFocus')).toBe('True');
  await thirdItem.sendKeys([tab]);
  expect(await afterZone.getAttribute('HasKeyboardFocus')).toBe('True');
});
