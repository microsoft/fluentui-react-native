import NavigateAppPage from '../../common/NavigateAppPage';
import CornerRadiusTokensPageObject from '../pages/CornerRadiusTokensPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('CornerRadiusTokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to CornerRadiusTokens test page', async () => {
    await CornerRadiusTokensPageObject.mobileScrollToComponentButton();
    await CornerRadiusTokensPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCornerRadiusTokensPage();
    await CornerRadiusTokensPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CornerRadiusTokensPageObject.isPageLoaded()).toBeTruthy();
  });
});
