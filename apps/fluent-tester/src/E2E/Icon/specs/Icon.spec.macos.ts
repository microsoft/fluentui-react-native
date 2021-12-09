import NavigateAppPage from '../../common/NavigateAppPage.macos';
import IconPageObject from '../pages/IconPageObject.macos';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Icon Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Icon test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    IconPageObject.scrollToComponentButton();
    IconPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToIconPage();
    IconPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(IconPageObject.isPageLoaded()).toBeTruthy();
  });
});
