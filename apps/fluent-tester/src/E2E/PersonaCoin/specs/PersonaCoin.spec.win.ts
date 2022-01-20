import NavigateAppPage from '../../common/NavigateAppPage.win';
import PersonaCoinPageObject from '../pages/PersonaCoinPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('PersonaCoin Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to PersonaCoin test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    PersonaCoinPageObject.scrollToComponentButton();
    PersonaCoinPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToPersonaCoinPage();
    PersonaCoinPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(PersonaCoinPageObject.isPageLoaded()).toBeTruthy(PersonaCoinPageObject.ERRORMESSAGE_PAGELOAD);

    expect(PersonaCoinPageObject.didAssertPopup()).toBeFalsy(PersonaCoinPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
