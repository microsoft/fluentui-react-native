import NavigateAppPage from '../../common/NavigateAppPage';
import PressablePageObject from '../pages/PressablePageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Pressable Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Pressable test page', async () => {
    await PressablePageObject.mobileScrollToComponentButton();
    await PressablePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToPressablePage();
    await PressablePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await PressablePageObject.isPageLoaded()).toBeTruthy();
  });
});
