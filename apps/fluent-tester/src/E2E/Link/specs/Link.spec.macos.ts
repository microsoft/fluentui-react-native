import NavigateAppPage from '../../common/NavigateAppPage';
import LinkPageObject from '../pages/LinkPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Link test page', async () => {
    await LinkPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToLinkPage();
    await LinkPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await LinkPageObject.isPageLoaded()).toBeTruthy();
  });
});
