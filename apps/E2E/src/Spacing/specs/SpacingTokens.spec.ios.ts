import NavigateAppPage from '../../common/NavigateAppPage';
import SpacingTokensPageObject from '../pages/SpacingTokensPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Spacing Tokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Spacing tokens test page', async () => {
    await SpacingTokensPageObject.mobileScrollToComponentButton();
    await SpacingTokensPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToSpacingTokensPage();
    await SpacingTokensPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await SpacingTokensPageObject.isPageLoaded()).toBeTruthy();
  });
});
