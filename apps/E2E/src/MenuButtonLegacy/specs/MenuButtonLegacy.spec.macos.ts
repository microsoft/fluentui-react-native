import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonLegacyPageObject from '../pages/MenuButtonLegacyPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButton Legacy test page', async () => {
    await MenuButtonLegacyPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuButtonLegacyPage();
    await MenuButtonLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuButtonLegacyPageObject.isPageLoaded()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
