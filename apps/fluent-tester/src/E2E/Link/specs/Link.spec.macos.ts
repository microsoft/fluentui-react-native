import NavigateAppPage from '../../common/NavigateAppPage.macos';
import LinkPageObject from '../pages/LinkPageObject.macos';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Link test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    LinkPageObject.scrollToComponentButton();
    LinkPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToLinkPage();
    LinkPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(LinkPageObject.isPageLoaded()).toBeTruthy();
  });
});
