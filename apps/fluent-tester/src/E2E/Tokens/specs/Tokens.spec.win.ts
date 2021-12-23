import NavigateAppPage from '../../common/NavigateAppPage.win';
import TokenPageObject from '../pages/TokensPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tokens Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Tokens test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    TokenPageObject.scrollToComponentButton();
    TokenPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToTokensPage();
    TokenPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TokenPageObject.isPageLoaded()).toBeTruthy();
  });
});
