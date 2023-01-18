import NavigateAppPage from '../../common/NavigateAppPage';
import CornerRadiusTokensPageObject from '../pages/CornerRadiusTokensPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('CornerRadiusTokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CornerRadiusTokens test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCornerRadiusTokensPage();
    await CornerRadiusTokensPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CornerRadiusTokensPageObject.isPageLoaded()).toBeTruthy(CornerRadiusTokensPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await CornerRadiusTokensPageObject.didAssertPopup()).toBeFalsy(CornerRadiusTokensPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
