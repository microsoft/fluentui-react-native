import NavigateAppPage from '../../common/NavigateAppPage';
import TabsPageObject from '../pages/TabsPageObject';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Tabs test page', async () => {
    await TabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsPage();
    await TabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsPageObject.isPageLoaded()).toBeTruthy();
  });
});
