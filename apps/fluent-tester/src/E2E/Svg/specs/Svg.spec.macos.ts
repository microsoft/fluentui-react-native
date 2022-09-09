import NavigateAppPage from '../../common/NavigateAppPage';
import SvgPageObject from '../pages/SvgPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Svg Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Svg test page', async () => {
    await SvgPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToSvgPage();
    await SvgPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await SvgPageObject.isPageLoaded()).toBeTruthy();
  });
});
