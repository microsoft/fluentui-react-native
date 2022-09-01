import NavigateAppPage from '../../common/NavigateAppPage.macos';
import PersonaCoinPageObject from '../pages/PersonaCoinPageObject.macos';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('PersonaCoin Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to PersonaCoin test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await PersonaCoinPageObject.scrollToComponentButton();
    await PersonaCoinPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToPersonaCoinPage();
    await PersonaCoinPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await PersonaCoinPageObject.isPageLoaded()).toBeTruthy();
  });
});
