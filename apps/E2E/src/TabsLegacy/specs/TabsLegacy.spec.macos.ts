import NavigateAppPage from '../../common/NavigateAppPage';
import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    await TabsLegacyPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsLegacyPage();
    await TabsLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
