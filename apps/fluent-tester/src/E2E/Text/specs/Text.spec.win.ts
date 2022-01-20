import NavigateAppPage from '../../common/NavigateAppPage.win';
import TextPageObject from '../pages/TextPageObject.win';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    TextPageObject.scrollToComponentButton();
    TextPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToTextPage();
    TextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TextPageObject.isPageLoaded()).toBeTruthy(TextPageObject.ERRORMESSAGE_PAGELOAD);

    expect(TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Text Accessibility Testing', () => {
  it('Text - Validate accessibilityRole is correct', () => {
    TextPageObject.scrollToTestElement();
    TextPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(TextPageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
  });
});
