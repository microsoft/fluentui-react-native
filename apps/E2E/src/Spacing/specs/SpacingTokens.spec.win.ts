import NavigateAppPage from '../../common/NavigateAppPage';
import SpacingTokensPageObject from '../pages/SpacingTokensPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Spacing Token Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to spacing tokens test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToSpacingTokensPage();
    await SpacingTokensPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await SpacingTokensPageObject.isPageLoaded()).toBeTruthy(SpacingTokensPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await SpacingTokensPageObject.didAssertPopup()).toBeFalsy(SpacingTokensPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
