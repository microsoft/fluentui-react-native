import NavigateAppPage from '../../common/NavigateAppPage';
import CalloutPageObject from '../pages/CalloutPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Callout test page', async () => {
    await CalloutPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCalloutPage();
    await CalloutPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CalloutPageObject.isPageLoaded()).toBeTruthy(CalloutPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
