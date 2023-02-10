import NavigateAppPage from '../../common/NavigateAppPage';
import ColorTokenPageObject from '../pages/ColorTokensPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Color Tokens Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Color Tokens test page', async () => {
    await ColorTokenPageObject.mobileScrollToComponentButton();
    await ColorTokenPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToColorTokensPage();
    await ColorTokenPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ColorTokenPageObject.isPageLoaded()).toBeTruthy(ColorTokenPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
