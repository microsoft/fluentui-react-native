import NavigateAppPage from '../../common/NavigateAppPage.win';
import ContextualMenuPageObjectObject, { ContextualMenuSelector } from '../pages/ContextualMenuPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to ContextualMenu test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ContextualMenuPageObjectObject.scrollToComponentButton();
    ContextualMenuPageObjectObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToContextualMenuPage();
    ContextualMenuPageObjectObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ContextualMenuPageObjectObject.isPageLoaded()).toBeTruthy();
  });
});

describe('ContextualMenu Functional Tests', () => {
  /* Scrolls and waits for the ContextualMenu to be visible on the Test Page */
  beforeEach(() => {
    ContextualMenuPageObjectObject.scrollToTestElement();
    ContextualMenuPageObjectObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    ContextualMenuPageObjectObject.sendKey(ContextualMenuSelector.ContextualMenu, Keys.Escape); // Reset ContextualMenu state for next test
  });

  it('Click on ContextualMenu Button and validate that the list of ContextualMenu Items open', () => {
    /* Click on the ContextualMenu */
    ContextualMenuPageObjectObject.clickComponent();
    ContextualMenuPageObjectObject.waitForContextualMenuItemsToOpen(PAGE_TIMEOUT);

    expect(ContextualMenuPageObjectObject.contextualMenuItemDisplayed()).toBeTruthy();
  });

  it('Type "SpaceBar" to select the ContextualMenu and validate that the list of ContextualMenu Items open', () => {
    /* Type a space on the ContextualMenu */
    ContextualMenuPageObjectObject.sendKey(ContextualMenuSelector.ContextualMenu, Keys.Spacebar);
    ContextualMenuPageObjectObject.waitForContextualMenuItemsToOpen(PAGE_TIMEOUT);

    expect(ContextualMenuPageObjectObject.contextualMenuItemDisplayed()).toBeTruthy();
  });

  /* Runs after all tests. This ensures the ContextualMenu closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(() => {
    ContextualMenuPageObjectObject.sendKey(ContextualMenuSelector.ContextualMenu, Keys.Escape); // Reset ContextualMenu state for next test
  });
});
