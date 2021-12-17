import NavigateAppPage from '../../common/NavigateAppPage.macos';
import SvgPageObject from '../pages/SvgPageObject.macos';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Svg Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Svg test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    SvgPageObject.scrollToComponentButton();
    SvgPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToSvgPage();
    SvgPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(SvgPageObject.isPageLoaded()).toBeTruthy();
  });
});
