import NavigateAppPage from '../../common/NavigateAppPage.win';
import ButtonPageObject from '../pages/ButtonPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../../FluentTester/TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ButtonPageObject.scrollToComponentButton();
    ButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToButtonPage();
    ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ButtonPageObject.isPageLoaded()).toBeTruthy(ButtonPageObject.ERRORMESSAGE_PAGELOAD);
    expect(ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Accessibility Testing', () => {
  it('Button - Validate accessibilityRole is correct', () => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ButtonPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
    expect(ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Button - Set accessibilityLabel', () => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(BUTTON_ACCESSIBILITY_LABEL);
    expect(ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Button - Do not set accessibilityLabel -> Default to Button label', () => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(BUTTON_TEST_COMPONENT_LABEL);
    expect(ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});
