import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupPageObject, { RadioButtonSelector } from '../pages/RadioGroupPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';
import {
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
  SECOND_RADIO_BUTTON_LABEL,
} from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to RadioGroup test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToRadioGroupPage();
    await RadioGroupPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await RadioGroupPageObject.isPageLoaded()).toBeTruthy(RadioGroupPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroup/RadioButton Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupPageObject.scrollToTestElement();
  });

  it('Validate RadioGroup\'s "accessibilityRole" defaults to List "ControlType" element attribute.', async () => {
    await expect(await RadioGroupPageObject.getAccessibilityRole()).toEqual(RADIOGROUP_A11Y_ROLE);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate RadioButton\'s "accessibilityRole" defaults to RadioButton "ControlType" element attribute.', async () => {
    await expect(await RadioGroupPageObject.getRadioButtonAccesibilityRole()).toEqual(RADIOBUTTON_A11Y_ROLE);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set RadioGroup "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(await RadioGroupPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(RADIOGROUP_ACCESSIBILITY_LABEL);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set RadioGroup "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioGroup label.', async () => {
    await expect(await RadioGroupPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(RADIOGROUP_TEST_COMPONENT_LABEL);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set RadioButton "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(await RadioGroupPageObject.getRBAccessibilityLabel(RadioButtonSelector.First)).toEqual(
      FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
    );
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set RadioButton "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioButton label.', async () => {
    await expect(await RadioGroupPageObject.getRBAccessibilityLabel(RadioButtonSelector.Second)).toEqual(SECOND_RADIO_BUTTON_LABEL);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroup Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st RadioButton in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupPageObject.scrollToTestElement();

    await RadioGroupPageObject.resetRadioGroupSelection();
  });

  it('Click on a RadioButton. Validate that it changes state from unselected to selected.', async () => {
    /* Validate the RadioButton is not initially selected */
    await expect(await RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Second)).toBeFalsy();

    /* Click on the RadioButton to select it */
    await RadioGroupPageObject.clickRadioButton(RadioButtonSelector.Second);
    await RadioGroupPageObject.waitForRadioButtonSelected(RadioButtonSelector.Second, PAGE_TIMEOUT);

    /* Validate the RadioButton is selected */
    await expect(await RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Second)).toBeTruthy();
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Arrow Key" on a RadioButton. Validate adjacent RadioButton is newly selected.', async () => {
    // Presses the ArrowDown key while the first (A) RadioButton is selected
    await RadioGroupPageObject.sendKey(Keys.ARROW_DOWN, RadioButtonSelector.First);
    await RadioGroupPageObject.waitForRadioButtonSelected(RadioButtonSelector.Second, 5000);

    /* Validate the RadioButton is selected */
    await expect(await RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Second)).toBeTruthy();
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Arrow Key" on a RadioButton adjacent to a disabled RadioButton. Validate disabled RadioButton is skipped and the RadioButton after is newly selected.', async () => {
    // Presses the ArrowDown key while the second (B) RadioButton is selected
    await RadioGroupPageObject.sendKey(Keys.ARROW_DOWN, RadioButtonSelector.Second);
    await RadioGroupPageObject.waitForRadioButtonSelected(RadioButtonSelector.Fourth, 5000); // It should skip RadioButton 3 since it is disabled

    /* Validate the RadioButton is selected */
    await expect(await RadioGroupPageObject.isRadioButtonSelected(RadioButtonSelector.Fourth)).toBeTruthy();
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });
});
