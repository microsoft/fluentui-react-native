import NavigateAppPage from '../../common/NavigateAppPage';
import StrokeWidthTokensPageObject from '../pages/StrokeWidthTokensPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Stroke Width Token Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to stroke width tokens test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToStrokeWidthTokensPage();
    await StrokeWidthTokensPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await StrokeWidthTokensPageObject.isPageLoaded()).toBeTruthy(StrokeWidthTokensPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await StrokeWidthTokensPageObject.didAssertPopup()).toBeFalsy(StrokeWidthTokensPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
