import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonPageObject from '../pages/ButtonPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Button test page', async () => {
    await ButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonPageObject.isPageLoaded()).toBeTruthy();
  });
});
