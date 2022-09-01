import NavigateAppPage from '../../common/NavigateAppPage.macos';
import TextPageObject from '../pages/TextPageObject.macos';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Text test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await TextPageObject.scrollToComponentButton();
    await TextPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextPage();
    await TextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextPageObject.isPageLoaded()).toBeTruthy();
  });
});
