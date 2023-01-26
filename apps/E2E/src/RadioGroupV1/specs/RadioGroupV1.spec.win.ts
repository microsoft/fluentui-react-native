import RadioGroupV1PageObject, { Radio } from '../pages/RadioGroupV1PageObject';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import {
  RADIOGROUPV1_ACCESSIBILITY_LABEL,
  RADIOGROUPV1_TEST_COMPONENT_LABEL,
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  SECOND_RADIO_LABEL,
} from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroupV1/RadioV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await RadioGroupV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to RadioGroupV1 test page', async () => {
    await RadioGroupV1PageObject.navigateToPageAndLoadTests(true);

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroupV1/RadioV1 Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupV1PageObject.scrollToTestElement();
  });

  it('Validate RadioGroup\'s "accessibilityRole" defaults to "List.ControlType".', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        Attribute.AccessibilityRole,
        RADIOGROUP_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Radio\'s "accessibilityRole" defaults to "RadioButton.ControlType".', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio(Radio.First),
        Attribute.AccessibilityRole,
        RADIOBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set RadioGroup "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        RADIOGROUPV1_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set RadioGroup "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioGroup label.', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        RADIOGROUPV1_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set Radio "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio(Radio.First),
        Attribute.AccessibilityLabel,
        FIRST_RADIO_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set Radio "accessibilityLabel" prop. Validate "Name" element attribute defaults to current Radio label.', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio(Radio.Second),
        Attribute.AccessibilityLabel,
        SECOND_RADIO_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroupV1 Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupV1PageObject.scrollToTestElement();

    await RadioGroupV1PageObject.resetRadioGroupSelection();
  });

  it('Click on a Radio. Validate that it changes state from unselected to selected.', async () => {
    /* Validate the Radio is not initially selected */
    await expect(await RadioGroupV1PageObject.isRadioSelected(Radio.Second)).toBeFalsy(
      'Expected radio #2 to be unselected at test start, but #2 was initially selected.',
    );

    /* Click on the Radio to select it */
    await RadioGroupV1PageObject.click(RadioGroupV1PageObject.getRadio(Radio.Second));

    /* Validate the Radio is selected */
    await expect(
      await RadioGroupV1PageObject.waitForRadioSelected(
        Radio.Second,
        'Expected radio #2 to be selected by click, but #2 remained unselected.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Navigate to unselected radio using "DOWN ARROW" key. Validate state changes from unselected to selected.', async () => {
    // Presses the ArrowDown key while the first (A) Radio is selected
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio(Radio.First), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(
      await RadioGroupV1PageObject.waitForRadioSelected(
        Radio.Second,
        'Expected radio #2 to be selected by a "DOWN ARROW" input from radio #1.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Navigate to unselected radio using "DOWN ARROW" key. Validate disabled Radio is skipped.', async () => {
    // Presses the ArrowDown key while the second (B) Radio is selected
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio(Radio.Second), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(
      await RadioGroupV1PageObject.waitForRadioSelected(
        Radio.Fourth,
        'Expected radio #4 to be selected by a "DOWN ARROW" input from radio #2 and radio #3 (disabled) to be skipped.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "DOWN ARROW" on the last Radio of a RadioGroup. Validate circular navigation functions correctly.', async () => {
    // Presses the ArrowDown key while the fourth (D) Radio is selected
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio(Radio.Fourth), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(
      await RadioGroupV1PageObject.waitForRadioSelected(
        Radio.First,
        'Expected radio #1 to be selected by a "DOWN ARROW" input from radio #4.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "TAB" on a Radio. Validate Radio in the next RadioGroup is focused.', async () => {
    // Presses the Tab key while the second (B) Radio is selected in first RadioGroup
    await RadioGroupV1PageObject.sendKeys(RadioGroupV1PageObject.getRadio(Radio.Second), [Keys.TAB]);

    /* Validate the Radio is not focused */
    await expect(
      await RadioGroupV1PageObject.waitForRadioFocused(
        Radio.Fifth,
        'Expected radio #5 to be focused by a "TAB" input from previous radio group.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
