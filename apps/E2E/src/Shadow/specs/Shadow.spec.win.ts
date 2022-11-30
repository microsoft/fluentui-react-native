import NavigateAppPage from '../../common/NavigateAppPage';
import ShadowPageObject from '../pages/ShadowPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shadow Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Shadow test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToShadowPage();
    await ShadowPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ShadowPageObject.isPageLoaded()).toBeTruthy(ShadowPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ShadowPageObject.didAssertPopup()).toBeFalsy(ShadowPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
