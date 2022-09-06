import NavigateAppPage from '../../common/NavigateAppPage.macos';
import TabsPageObject from '../pages/TabsPageObject.macos';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Tabs test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await TabsPageObject.scrollToComponentButton();
    await TabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsPage();
    await TabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsPageObject.isPageLoaded()).toBeTruthy();
  });
});
