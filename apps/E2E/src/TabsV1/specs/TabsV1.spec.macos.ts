import NavigateAppPage from '../../common/NavigateAppPage';
import TabsV1PageObject from '../pages/TabsV1PageObject';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to TabsV1 test page', async () => {
    await TabsV1PageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsV1Page();
    await TabsV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsV1PageObject.isPageLoaded()).toBeTruthy();
  });
});
