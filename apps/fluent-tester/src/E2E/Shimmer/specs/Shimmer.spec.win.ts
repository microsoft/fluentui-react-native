import NavigateAppPage from '../../common/NavigateAppPage';
import ShimmerPageObject from '../pages/ShimmerPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { Platform } from '../../common/BasePage';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shimmer Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Shimmer test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await ShimmerPageObject.scrollToComponentButton(Platform.Win32);
    await ShimmerPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToShimmerPage();
    await ShimmerPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ShimmerPageObject.isPageLoaded()).toBeTruthy(ShimmerPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ShimmerPageObject.didAssertPopup()).toBeFalsy(ShimmerPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
