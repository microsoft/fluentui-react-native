import NavigateAppPage from '../../common/NavigateAppPage';
import AvatarPageObject from '../pages/AvatarPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Avatar test page', async () => {
    await AvatarPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToAvatarPage();
    await AvatarPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await AvatarPageObject.isPageLoaded()).toBeTruthy(AvatarPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
