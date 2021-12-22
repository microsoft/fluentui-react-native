import NavigateAppPage from '../../common/NavigateAppPage.win';
import ExperimentalCheckboxPageObject from '../pages/ExperimentalCheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import {
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
} from '../../../FluentTester/TestComponents/CheckboxExperimental/consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CHECKBOX_A11Y_ROLE } from '../../common/consts';

describe('Experimental Checkbox Testing Initialization', () => {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Experimental Checkbox test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ExperimentalCheckboxPageObject.scrollToComponentButton();
    ExperimentalCheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToCheckboxExperimentalPage();
    ExperimentalCheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalCheckboxPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('Experimental Checkbox Accessibility Testing', () => {
  it('Experimental Checkbox - Validate accessibilityRole is correct', () => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalCheckboxPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
  });

  it('Experimental Checkbox - Set accessibilityLabel', () => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalCheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
    );
  });

  it('Experimental Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', () => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalCheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
    );
  });
});
