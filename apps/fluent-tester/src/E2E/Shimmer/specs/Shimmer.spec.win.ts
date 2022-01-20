import NavigateAppPage from '../../common/NavigateAppPage.win';
import ShimmerPageObject from '../pages/ShimmerPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shimmer Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Shimmer test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ShimmerPageObject.scrollToComponentButton();
    ShimmerPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToShimmerPage();
    ShimmerPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ShimmerPageObject.isPageLoaded()).toBeTruthy();

    expect(ShimmerPageObject.didAssertPopup()).toBeFalsy(); // Ensure no asserts popped up
  });
});
