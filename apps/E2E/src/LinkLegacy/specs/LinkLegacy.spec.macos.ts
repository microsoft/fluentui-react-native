import NavigateAppPage from '../../common/NavigateAppPage';
import LinkLegacyPageObject from '../pages/LinkLegacyPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Link Legacy test page', async () => {
    await LinkLegacyPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToLinkLegacyPage();
    await LinkLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await LinkLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
