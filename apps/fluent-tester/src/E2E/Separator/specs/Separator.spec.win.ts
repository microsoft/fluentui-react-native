import NavigateAppPage from '../../common/NavigateAppPage.win';
import SeparatorPageObject from '../pages/SeparatorPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Separator Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Separator test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    SeparatorPageObject.scrollToComponentButton();
    SeparatorPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToSeparatorPage();
    SeparatorPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(SeparatorPageObject.isPageLoaded()).toBeTruthy(SeparatorPageObject.ERRORMESSAGE_PAGELOAD);
    expect(SeparatorPageObject.didAssertPopup()).toBeFalsy(SeparatorPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
