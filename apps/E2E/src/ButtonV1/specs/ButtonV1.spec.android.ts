import NavigateAppPage from '../../common/NavigateAppPage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import ButtonV1PageObject from '../pages/ButtonV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Button test page', async () => {
    await ButtonV1PageObject.mobileScrollToComponentButton();
    await ButtonV1PageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonV1PageObject.isPageLoaded()).toBeTruthy();
  });
});
