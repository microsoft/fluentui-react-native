import NavigateAppPage from '../../common/NavigateAppPage.win';
import CalloutPageObject from '../pages/CalloutPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Callout test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    CalloutPageObject.scrollToComponentButton();
    CalloutPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToCalloutPage();
    CalloutPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(CalloutPageObject.isPageLoaded()).toBeTruthy(CalloutPageObject.ERRORMESSAGE_PAGELOAD);

    expect(CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

/* This will be re-enabled after the Callout's ViewManager integrates the testID prop. This is used to select UI components */
// describe('Callout Functional Testing', () => {
//   it('Open the callout and validate it loaded correctly (visible)', () => {
//     CalloutPageObject.scrollToTestElement();
//     CalloutPageObject.openCallout();
//     CalloutPageObject.waitForCalloutComponentInView(PAGE_TIMEOUT);
//     expect(CalloutPageObject.didCalloutLoad()).toBeTruthy();
//   });
// });

// describe('Callout Accessibility Testing', () => {
//   it('Validate accessibilityRole is correct', () => {
//     CalloutPageObject.scrollToTestElement();
//     CalloutPageObject.waitForCalloutComponentInView(PAGE_TIMEOUT);
//     expect(CalloutPageObject.getAccessibilityRole()).toEqual(CALLOUT_A11Y_ROLE);
//   });

//   it('Set accessibilityLabel', () => {
//     CalloutPageObject.scrollToTestElement();
//     CalloutPageObject.waitForCalloutComponentInView(PAGE_TIMEOUT);
//     expect(CalloutPageObject.getAccessibilityLabel(CalloutSelector.Primary)).toEqual(CALLOUT_ACCESSIBILITY_LABEL);
//   });
// });
