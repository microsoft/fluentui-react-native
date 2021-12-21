import NavigateAppPage from '../../common/NavigateAppPage.win';
import ExperimentalMenuButtonPageObject from '../pages/ExperimentalMenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE } from '../../common/consts';
import {
  EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
} from '../../../FluentTester/TestComponents/MenuButtonExperimental/consts';
import { ComponentSelector } from '../../common/BasePage.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental MenuButton Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Experimental MenuButton test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ExperimentalMenuButtonPageObject.scrollToComponentButton();
    ExperimentalMenuButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToExperimentalMenuButtonPage();
    ExperimentalMenuButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalMenuButtonPageObject.isPageLoaded()).toBeTruthy();
  });
});

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
describe('Experimental MenuButton Accessibility Testing', () => {
  it('Experimental MenuButton - Validate accessibilityRole is correct', () => {
    ExperimentalMenuButtonPageObject.scrollToTestElement();
    ExperimentalMenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalMenuButtonPageObject.getAccessibilityRole()).toEqual(MENUBUTTON_A11Y_ROLE);
  });

  it('Experimental MenuButton - Set accessibilityLabel', () => {
    ExperimentalMenuButtonPageObject.scrollToTestElement();
    ExperimentalMenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalMenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
    );
  });

  it('Do not set accessibilityLabel -> Default to Experimental MenuButton label', () => {
    ExperimentalMenuButtonPageObject.scrollToTestElement();
    ExperimentalMenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalMenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
    );
  });
});
