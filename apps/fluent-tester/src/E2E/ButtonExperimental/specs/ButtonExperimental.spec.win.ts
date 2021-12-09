import NavigateAppPage from '../../common/NavigateAppPage.win';
import ButtonExperimentalPageObject from '../pages/ButtonExperimentalPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE } from '../../common/consts';
import {
  BUTTONEXPERIMENTAL_ACCESSIBILITY_LABEL,
  BUTTONEXPERIMENTAL_TEST_COMPONENT_LABEL,
} from '../../../FluentTester/TestComponents/ButtonExperimental/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Button test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ButtonExperimentalPageObject.scrollToComponentButton();
    ButtonExperimentalPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToExperimentalButtonPage();
    ButtonExperimentalPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ButtonExperimentalPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('Button Accessibility Testing', () => {
  it('Button - Validate accessibilityRole is correct', () => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ButtonExperimentalPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
  });

  it('Button - Set accessibilityLabel', () => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ButtonExperimentalPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(BUTTONEXPERIMENTAL_ACCESSIBILITY_LABEL);
  });

  it('Button - Do not set accessibilityLabel -> Default to Button label', () => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ButtonExperimentalPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      BUTTONEXPERIMENTAL_TEST_COMPONENT_LABEL,
    );
  });
});
