import { Attribute, AttributeValue, Keys, RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE } from '../../common/consts';
import {
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  RADIOGROUPV1_ACCESSIBILITY_LABEL,
  RADIOGROUPV1_TEST_COMPONENT_LABEL,
  SECOND_RADIO_LABEL,
} from '../consts';
import RadioGroupV1PageObject from '../pages/RadioGroupV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroupV1/RadioV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await RadioGroupV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to RadioGroupV1 test page', async () => {
    expect(await RadioGroupV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await RadioGroupV1PageObject.enableE2ETesterMode()).toBeTrue();

    expect(await RadioGroupV1PageObject.didAssertPopup())
      .withContext(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('RadioGroupV1/RadioV1 Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupV1PageObject.scrollToTestElement();
  });

  it('Validate RadioGroup\'s "accessibilityRole" defaults to "ControlType.List".', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        Attribute.AccessibilityRole,
        RADIOGROUP_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Validate Radio\'s "accessibilityRole" defaults to "ControlType.RadioButton".', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio('First'),
        Attribute.AccessibilityRole,
        RADIOBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Set RadioGroup "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        RADIOGROUPV1_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set RadioGroup "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioGroup label.', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        RADIOGROUPV1_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Set Radio "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio('First'),
        Attribute.AccessibilityLabel,
        FIRST_RADIO_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set Radio "accessibilityLabel" prop. Validate "Name" element attribute defaults to current Radio label.', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio('Second'),
        Attribute.AccessibilityLabel,
        SECOND_RADIO_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Set "required" prop on RadioGroup. Validate "IsRequiredForForm" element attribute is true.', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._secondaryComponent,
        Attribute.IsRequiredForForm,
        AttributeValue.true,
      ),
    ).toBeTruthy();
  });

  it('Do NOT set "required" prop on RadioGroup. Validate "IsRequiredForForm" element attribute is false.', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        Attribute.IsRequiredForForm,
        AttributeValue.false,
      ),
    ).toBeTruthy();
  });
});

describe('RadioGroupV1 Functional Testing', () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupV1PageObject.scrollToTestElement();

    await RadioGroupV1PageObject.resetRadioGroupSelection();
  });

  it('Click on a Radio. Validate that it changes state from unselected to selected.', async () => {
    /* Validate the Radio is not initially selected */
    expect(await RadioGroupV1PageObject.isRadioSelected('Second')).toBeFalsy(
      'Expected radio #2 to be unselected at test start, but #2 was initially selected.',
    );

    /* Click on the Radio to select it */
    await RadioGroupV1PageObject.click(RadioGroupV1PageObject.getRadio('Second'));

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1PageObject.waitForRadioSelected('Second', 'Expected radio #2 to be selected by click, but #2 remained unselected.'),
    ).toBeTruthy();

    expect(await RadioGroupV1PageObject.didAssertPopup())
      .withContext(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigate to unselected radio using "DOWN ARROW" key. Validate state changes from unselected to selected.', async () => {
    // Presses the ArrowDown key while the first (A) Radio is selected
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio('First'), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1PageObject.waitForRadioSelected(
        'Second',
        'Expected radio #2 to be selected by a "DOWN ARROW" input from radio #1.',
      ),
    ).toBeTruthy();

    expect(await RadioGroupV1PageObject.didAssertPopup())
      .withContext(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigate to unselected radio using "DOWN ARROW" key. Validate disabled Radio is skipped.', async () => {
    // Presses the ArrowDown key while the second (B) Radio is selected
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio('Second'), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1PageObject.waitForRadioSelected(
        'Fourth',
        'Expected radio #4 to be selected by a "DOWN ARROW" input from radio #2 and radio #3 (disabled) to be skipped.',
      ),
    ).toBeTruthy();

    expect(await RadioGroupV1PageObject.didAssertPopup())
      .withContext(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "DOWN ARROW" on the last Radio of a RadioGroup. Validate circular navigation functions correctly.', async () => {
    // Presses the ArrowDown key while the fourth (D) Radio is selected
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio('Fourth'), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(
      await RadioGroupV1PageObject.waitForRadioSelected('First', 'Expected radio #1 to be selected by a "DOWN ARROW" input from radio #4.'),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup())
      .withContext(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "TAB" on a Radio. Validate Radio in the next RadioGroup is focused.', async () => {
    // Presses the Tab key while the second (B) Radio is selected in first RadioGroup
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio('Second'), [Keys.TAB]);

    /* Validate the Radio is not focused */
    await expect(
      await RadioGroupV1PageObject.waitForRadioFocused(
        'Fifth',
        'Expected radio #5 to be focused by a "TAB" input from previous radio group.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup())
      .withContext(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
