import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonLegacyPageObject from '../pages/ButtonLegacyPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Button Legacy test page', async () => {
    await ButtonLegacyPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
