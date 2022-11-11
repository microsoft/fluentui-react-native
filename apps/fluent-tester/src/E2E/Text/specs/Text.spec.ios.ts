import NavigateAppPage from '../../common/NavigateAppPage';
import TextPageObject from '../pages/TextPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Text test page', async () => {
    await TextPageObject.mobileScrollToComponentButton();
    await TextPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextPage();
    await TextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextPageObject.isPageLoaded()).toBeTruthy();
  });
});
