import NavigateAppPage from '../../common/NavigateAppPage';
import SpinnerPageObject from '../pages/SpinnerPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Spinner Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Spinner test page', async () => {
    await SpinnerPageObject.mobileScrollToComponentButton();
    await SpinnerPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToSpinnerPage();
    await SpinnerPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await SpinnerPageObject.isPageLoaded()).toBeTruthy(SpinnerPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
