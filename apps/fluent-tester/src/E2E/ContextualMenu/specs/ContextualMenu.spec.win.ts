import NavigateAppPage from '../../common/NavigateAppPage.win';
import ContextualMenuPageObjectObject from '../pages/ContextualMenuPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });
});

describe('ContextualMenu Functional Tests', () => {
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
