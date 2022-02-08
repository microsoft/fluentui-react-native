import NavigateAppPage from '../../common/NavigateAppPage.win';
import RadioGroupPageObject, { RadioButtonSelector } from '../pages/RadioGroupPageObject.win';
import { ComponentSelector } from '../../common/BasePage.win';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';
import {
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
  SECOND_RADIO_BUTTON_LABEL,
} from '../../../FluentTester/TestComponents/RadioGroup/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to RadioGroup test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    RadioGroupPageObject.scrollToComponentButton();
    RadioGroupPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToRadioGroupPage();
    RadioGroupPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(RadioGroupPageObject.isPageLoaded()).toBeTruthy(RadioGroupPageObject.ERRORMESSAGE_PAGELOAD);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroup/RadioButton Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(() => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it("Validate RadioGroup's accessibilityRole is correct", () => {
    expect(RadioGroupPageObject.getAccessibilityRole()).toEqual(RADIOGROUP_A11Y_ROLE);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate RadioButton's accessibilityRole is correct", () => {
    expect(RadioGroupPageObject.getRadioButtonAccesibilityRole()).toEqual(RADIOBUTTON_A11Y_ROLE);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioGroup - Set accessibilityLabel', () => {
    expect(RadioGroupPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(RADIOGROUP_ACCESSIBILITY_LABEL);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioGroup - Do not set accessibilityLabel -> Default to RadioGroup label', () => {
    expect(RadioGroupPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(RADIOGROUP_TEST_COMPONENT_LABEL);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioButton - Set accessibilityLabel', () => {
    expect(RadioGroupPageObject.getRBAccessibilityLabel(RadioButtonSelector.First)).toEqual(FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioButton - Do not set accessibilityLabel -> Default to RadioButton label', () => {
    expect(RadioGroupPageObject.getRBAccessibilityLabel(RadioButtonSelector.Second)).toEqual(SECOND_RADIO_BUTTON_LABEL);
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroup Functional Testing', () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st RadioButton in the RadioGroup */
  beforeEach(() => {
    RadioGroupPageObject.scrollToTestElement();
    RadioGroupPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    RadioGroupPageObject.resetRadioGroupSelection();
  });

  it('Click on a RadioButton and ensure it changes state from unselected -> selected', () => {
    /* Validate the RadioButton is not initially selected */
    expect(RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Second)).toBeFalsy();

    /* Click on the RadioButton to select it */
    RadioGroupPageObject.clickRadioButton(RadioButtonSelector.Second);
    RadioGroupPageObject.waitForRadioButtonSelected(RadioButtonSelector.Second, PAGE_TIMEOUT);

    /* Validate the RadioButton is selected */
    expect(RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Second)).toBeTruthy();
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboard to RadioButton and check for Selection state', () => {
    // Presses the ArrowDown key while the first (A) RadioButton is selected
    RadioGroupPageObject.sendKey(Keys.Down_Arrow, RadioButtonSelector.First);
    RadioGroupPageObject.waitForRadioButtonSelected(RadioButtonSelector.Second, 5000);

    /* Validate the RadioButton is selected */
    expect(RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Second)).toBeTruthy();
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Keyboard to DISABLED RadioButton and validate it doesn't get selected", () => {
    // Presses the ArrowDown key while the second (B) RadioButton is selected
    RadioGroupPageObject.sendKey(Keys.Down_Arrow, RadioButtonSelector.Second);
    RadioGroupPageObject.waitForRadioButtonSelected(RadioButtonSelector.Fourth, 5000); // It should skip RadioButton 3 since it is disabled

    /* Validate the RadioButton is selected */
    expect(RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Fourth)).toBeTruthy();
    expect(RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });
});
