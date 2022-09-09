import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonPageObject from '../pages/MenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButton test page', async () => {
    await MenuButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuButtonPage();
    await MenuButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuButtonPageObject.isPageLoaded()).toBeTruthy(MenuButtonPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
