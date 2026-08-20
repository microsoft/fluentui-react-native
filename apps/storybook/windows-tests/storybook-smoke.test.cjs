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

test('moves focus between Button Overview controls after a click', async () => {
  await selectStory('components-button--overview');

  const primary = await app.findElementByTestID('agentic-storybook-button-overview-primary');
  const secondary = await app.findElementByTestID('agentic-storybook-button-overview-secondary');
  await primary.waitForDisplayed({ timeout: 30000 });
  await secondary.waitForDisplayed({ timeout: 30000 });

  await primary.click();
  await browser.keys(['\uE004']);

  expect(await secondary.getAttribute('HasKeyboardFocus')).toBe('True');
});

test.each([
  ['components-tag--default', 'agentic-storybook-tag'],
  ['components-accordion--default', 'accordion-header'],
  ['components-tab--selected', 'agentic-storybook-tab-selected'],
  ['components-listboxitem--default', 'agentic-storybook-listbox-item'],
  ['components-checkbox--default', 'agentic-storybook-checkbox'],
  ['components-menuitem--selected', 'agentic-storybook-menu-item'],
  ['components-listitem--selected-focus', 'agentic-storybook-list-item-selected'],
  ['components-radio--default', 'agentic-storybook-radio'],
  ['components-switch--default', 'agentic-storybook-switch'],
])('focuses %s without terminating the app', async (storyId, testId) => {
  await selectStory(storyId);

  const element = await app.findElementByTestID(testId);
  await element.waitForDisplayed({ timeout: 30000 });
  await element.click();
  await new Promise((resolve) => setTimeout(resolve, 3000));

  expect(await element.getAttribute('HasKeyboardFocus')).toBe('True');
});

test('focuses the interactive Card without terminating the app', async () => {
  await selectStory('components-card--interactive');

  const card = await app.findElementByXPath('//Button[@Name="Open report"]');
  await card.waitForDisplayed({ timeout: 30000 });
  await card.click();
  await new Promise((resolve) => setTimeout(resolve, 3000));

  expect(await card.getAttribute('HasKeyboardFocus')).toBe('True');
});
