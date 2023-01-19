import NavigateAppPage from '../../common/NavigateAppPage';
import TextV1PageObject from '../pages/TextV1PageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TextV1 test page', async () => {
    await TextV1PageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextV1Page();
    await TextV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextV1PageObject.isPageLoaded()).toBeTruthy(TextV1PageObject.ERRORMESSAGE_PAGELOAD);
  });
});
