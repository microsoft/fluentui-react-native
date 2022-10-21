import NavigateAppPage from '../../common/NavigateAppPage';
import ContextualMenuPageObjectObject, { ContextualMenuSelector } from '../pages/ContextualMenuPageObject.win';
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
    await ContextualMenuPageObjectObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObjectObject.isPageLoaded()).toBeTruthy(ContextualMenuPageObjectObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ContextualMenuPageObjectObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObjectObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('ContextualMenu Functional Tests', async () => {
  /* Scrolls and waits for the ContextualMenu to be visible on the Test Page */
  beforeEach(async () => {
    await ContextualMenuPageObjectObject.scrollToTestElement();
    await ContextualMenuPageObjectObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await ContextualMenuPageObjectObject.sendKey(ContextualMenuSelector.ContextualMenu, Keys.ESCAPE); // Reset ContextualMenu state for next test
  });

  it('Click on ContextualMenu Button and validate that the list of ContextualMenu Items open', async () => {
    /* Click on the ContextualMenu */
    await ContextualMenuPageObjectObject.clickComponent();
    await ContextualMenuPageObjectObject.waitForContextualMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObjectObject.contextualMenuItemDisplayed()).toBeTruthy();
    await expect(await ContextualMenuPageObjectObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObjectObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Type "SPACE" to select the ContextualMenu and validate that the list of ContextualMenu Items open', async () => {
    /* Type a space on the ContextualMenu */
    await ContextualMenuPageObjectObject.sendKey(ContextualMenuSelector.ContextualMenu, Keys.SPACE);
    await ContextualMenuPageObjectObject.waitForContextualMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObjectObject.contextualMenuItemDisplayed()).toBeTruthy();
    await expect(await ContextualMenuPageObjectObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObjectObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  /* Runs after all tests. This ensures the ContextualMenu closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await ContextualMenuPageObjectObject.sendKey(ContextualMenuSelector.ContextualMenu, Keys.ESCAPE); // Reset ContextualMenu state for next test
  });
});
