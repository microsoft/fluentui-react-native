import NavigateAppPage from '../../common/NavigateAppPage';
import TextLegacyPageObject from '../pages/TextLegacyPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Text Legacy test page', async () => {
    await TextLegacyPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextLegacyPage();
    await TextLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
