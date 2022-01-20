import NavigateAppPage from '../../common/NavigateAppPage.win';
import CheckboxPageObject from '../pages/CheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../../../FluentTester/TestComponents/Checkbox/consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('Checkbox Testing Initialization', () => {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Checkbox test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    CheckboxPageObject.scrollToComponentButton();
    CheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToCheckboxPage();
    CheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(CheckboxPageObject.isPageLoaded()).toBeTruthy();

    expect(CheckboxPageObject.didAssertPopup()).toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('Checkbox Accessibility Testing', () => {
  it('Checkbox - Validate accessibilityRole is correct', () => {
    CheckboxPageObject.scrollToTestElement();
    CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(CheckboxPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
  });

  it('Checkbox - Set accessibilityLabel', () => {
    CheckboxPageObject.scrollToTestElement();
    CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CHECKBOX_ACCESSIBILITY_LABEL);
  });

  it('Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', () => {
    CheckboxPageObject.scrollToTestElement();
    CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(CHECKBOX_TEST_COMPONENT_LABEL);
  });
});
