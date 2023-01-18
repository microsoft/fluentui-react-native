import NavigateAppPage from '../../common/NavigateAppPage';
import StrokeWidthTokensPageObject from '../pages/StrokeWidthTokensPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Stroke Width Tokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Stroke width tokens test page', async () => {
    await StrokeWidthTokensPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToStrokeWidthTokensPage();
    await StrokeWidthTokensPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await StrokeWidthTokensPageObject.isPageLoaded()).toBeTruthy();
  });
});
