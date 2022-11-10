import NavigateAppPage from '../../common/NavigateAppPage';
import ShimmerPageObject from '../pages/ShimmerPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shimmer Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Shimmer test page', async () => {
    await ShimmerPageObject.mobileScrollToComponentButton();
    await ShimmerPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToShimmerPage();
    await ShimmerPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ShimmerPageObject.isPageLoaded()).toBeTruthy(ShimmerPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
