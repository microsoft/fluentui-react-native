import { PAGE_TIMEOUT } from '../../common/consts';
import ContextualMenuPageObject from '../pages/ContextualMenuPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ContextualMenuPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to ContextualMenu test page', async () => {
    expect(await ContextualMenuPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await ContextualMenuPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await ContextualMenuPageObject.didAssertPopup())
      .withContext(ContextualMenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('ContextualMenu Functional Tests', () => {
  /* Scrolls and waits for the ContextualMenu to be visible on the Test Page */
  beforeEach(async () => {
    await ContextualMenuPageObject.scrollToTestElement(await ContextualMenuPageObject._contextualMenu);
  });

  it('Click on ContextualMenu Button. Validate that the menu opens by checking if its items are displayed.', async () => {
    /* Click on the ContextualMenu */
    await ContextualMenuPageObject.click(ContextualMenuPageObject._contextualMenu);

    await expect(await ContextualMenuPageObject.waitForContextualMenuItemsToDisplay(PAGE_TIMEOUT)).toBeTruthy();

    await expect(await ContextualMenuPageObject.didAssertPopup())
      .withContext(ContextualMenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });

  /* Runs after all tests. This ensures the ContextualMenu closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await ContextualMenuPageObject.closeContextualMenu(); // Reset ContextualMenu state for next test
  });
});
