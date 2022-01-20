import NavigateAppPage from '../../common/NavigateAppPage.win';
import ExperimentalTextPageObject from '../pages/ExperimentalTextPageObject.win';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Text Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Experimental Text test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ExperimentalTextPageObject.scrollToComponentButton();
    ExperimentalTextPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToExperimentalTextPage();
    ExperimentalTextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalTextPageObject.isPageLoaded()).toBeTruthy();

    expect(ExperimentalTextPageObject.didAssertPopup()).toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('Experimental Text Accessibility Testing', () => {
  it('Text - Validate accessibilityRole is correct', () => {
    ExperimentalTextPageObject.scrollToTestElement();
    ExperimentalTextPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalTextPageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
  });
});
