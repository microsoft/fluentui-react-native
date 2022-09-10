import NavigateAppPage from '../../common/NavigateAppPage';
import TokenPageObject from '../pages/TokensPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { Platform } from '../../common/BasePage';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Tokens test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await TokenPageObject.scrollToComponentButton(Platform.Win32);
    await TokenPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTokensPage();
    await TokenPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TokenPageObject.isPageLoaded()).toBeTruthy(TokenPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TokenPageObject.didAssertPopup()).toBeFalsy(TokenPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
