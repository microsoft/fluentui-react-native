import NavigateAppPage from '../../common/NavigateAppPage';
import IconV1PageObject from '../pages/IconV1PageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('IconV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to IconV1 test page', async () => {
    await IconV1PageObject.mobileScrollToComponentButton();
    await IconV1PageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToIconPage();
    await IconV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await IconV1PageObject.isPageLoaded()).toBeTruthy();
  });
});
