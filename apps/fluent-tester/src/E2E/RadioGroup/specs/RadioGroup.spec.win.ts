import NavigateAppPage from '../../common/NavigateAppPage.win';
import RadioGroupPageObject, { RadioButtonSelector } from '../pages/RadioGroupPageObject.win';
import { ComponentSelector } from '../../common/BasePage.win';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import {
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  RADIOBUTTON_ACCESSIBILITY_LABEL,
  RADIOBUTTON_TEST_COMPONENT_LABEL,
} from '../../../FluentTester/TestComponents/RadioGroup/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to RadioGroup test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    RadioGroupPageObject.scrollToComponentButton();
    RadioGroupPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToRadioGroupPage();
    RadioGroupPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(RadioGroupPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('RadioGroup/RadioButton Accessibility Testing', () => {
  it("Validate RadioGroup's accessibilityRole is correct", () => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupPageObject.getAccessibilityRole()).toEqual(RADIOGROUP_A11Y_ROLE);
  });

  it("Validate RadioButton's accessibilityRole is correct", () => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupPageObject.getRadioButtonAccesibilityRole()).toEqual(RADIOBUTTON_A11Y_ROLE);
  });

  it('RadioGroup - Set accessibilityLabel', () => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(RADIOGROUP_ACCESSIBILITY_LABEL);
  });

  it('RadioGroup - Do not set accessibilityLabel -> Default to RadioGroup label', () => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(RADIOGROUP_TEST_COMPONENT_LABEL);
  });

  it('RadioButton - Set accessibilityLabel', () => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupPageObject.getRBAccessibilityLabel(RadioButtonSelector.Primary)).toEqual(RADIOBUTTON_ACCESSIBILITY_LABEL);
  });

  it('RadioButton - Do not set accessibilityLabel -> Default to RadioButton label', () => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupPageObject.getRBAccessibilityLabel(RadioButtonSelector.Secondary)).toEqual(RADIOBUTTON_TEST_COMPONENT_LABEL);
  });
});
