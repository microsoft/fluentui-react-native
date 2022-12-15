import NavigateAppPage from '../../common/NavigateAppPage';
import ContextualMenuPageObject from '../pages/ContextualMenuPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to ContextualMenu test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToContextualMenuPage();
    await ContextualMenuPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObject.isPageLoaded()).toBeTruthy(ContextualMenuPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ContextualMenuPageObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('ContextualMenu Functional Tests', async () => {
  /* Scrolls and waits for the ContextualMenu to be visible on the Test Page */
  beforeEach(async () => {
    await ContextualMenuPageObject.scrollToTestElement(await ContextualMenuPageObject._contextualMenu);

    await ContextualMenuPageObject.sendKeys(ContextualMenuPageObject._contextualMenu, [Keys.ESCAPE]); // Reset ContextualMenu state for next test
  });

  it('Click on ContextualMenu Button and validate that the list of ContextualMenu Items open', async () => {
    /* Click on the ContextualMenu */
    await ContextualMenuPageObject.click(ContextualMenuPageObject._contextualMenu);
    await ContextualMenuPageObject.waitForContextualMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObject.contextualMenuItemDisplayed()).toBeTruthy(
      'Contextual Menu Items failed to display via clicking the Contextual Menu.',
    );
    await expect(await ContextualMenuPageObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Type "SPACE" to select the ContextualMenu and validate that the list of ContextualMenu Items open', async () => {
    /* Type a space on the ContextualMenu */
    await ContextualMenuPageObject.sendKeys(ContextualMenuPageObject._contextualMenu, [Keys.SPACE]);
    await ContextualMenuPageObject.waitForContextualMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObject.contextualMenuItemDisplayed()).toBeTruthy(
      "Contextual Menu Items failed to display via pressing 'Space' on the Contextual Menu.",
    );
    await expect(await ContextualMenuPageObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  /* Runs after all tests. This ensures the ContextualMenu closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await ContextualMenuPageObject.sendKeys(ContextualMenuPageObject._contextualMenu, [Keys.ESCAPE]); // Reset ContextualMenu state for next test
  });
});
