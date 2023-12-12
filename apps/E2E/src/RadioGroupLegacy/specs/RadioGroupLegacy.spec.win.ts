import { Attribute, Keys, RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE } from '../../common/consts';
import {
  FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  SECOND_RADIO_BUTTON_LABEL,
} from '../consts';
import RadioGroupPageObject from '../pages/RadioGroupLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await RadioGroupPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to RadioGroup Legacy test page', async () => {
    expect(await RadioGroupPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await RadioGroupPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await RadioGroupPageObject.didAssertPopup())
      .withContext(RadioGroupPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('RadioGroup/RadioButton Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupPageObject.scrollToTestElement(await RadioGroupPageObject._firstRadioGroup);
  });

  it('Validate RadioGroup\'s "accessibilityRole" defaults to "ControlType.List".', async () => {
    expect(
      await RadioGroupPageObject.compareAttribute(RadioGroupPageObject._firstRadioGroup, Attribute.AccessibilityRole, RADIOGROUP_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Validate RadioButton\'s "accessibilityRole" defaults to "ControlType.RadioButton".', async () => {
    expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject.getRadioButton('First'),
        Attribute.AccessibilityRole,
        RADIOBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Set RadioGroup "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject._firstRadioGroup,
        Attribute.AccessibilityLabel,
        RADIOGROUP_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set RadioGroup "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioGroup label.', async () => {
    expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject._secondRadioGroup,
        Attribute.AccessibilityLabel,
        RADIOGROUP_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Set RadioButton "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject.getRadioButton('First'),
        Attribute.AccessibilityLabel,
        FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set RadioButton "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioButton label.', async () => {
    expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject.getRadioButton('Second'),
        Attribute.AccessibilityLabel,
        SECOND_RADIO_BUTTON_LABEL,
      ),
    ).toBeTruthy();
  });
});

describe('RadioGroup Legacy Functional Testing', () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st RadioButton in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupPageObject.scrollToTestElement(await RadioGroupPageObject._firstRadioGroup);

    await RadioGroupPageObject.resetRadioGroupSelection();
  });

  it('Click on a RadioButton. Validate that it changes state from unselected to selected.', async () => {
    /* Validate the RadioButton is not initially selected */
    expect(await RadioGroupPageObject.isRadioButtonSelected('Second')).toBeFalsy(
      'Expected the first RadioButton to be initially selected, but the second RadioButton was initially selected.',
    );

    /* Click on the RadioButton to select it */
    await RadioGroupPageObject.click(RadioGroupPageObject.getRadioButton('Second'));

    /* Validate the RadioButton is selected */
    expect(
      await RadioGroupPageObject.waitForRadioButtonSelected('Second', 'Clicked the second RadioButton, but it failed to be selected.'),
    ).toBeTruthy();

    expect(await RadioGroupPageObject.didAssertPopup())
      .withContext(RadioGroupPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press forward "Arrow Key" on a RadioButton. Validate adjacent RadioButton is newly selected.', async () => {
    // Presses the ArrowDown key while the first (A) RadioButton is selected
    await RadioGroupPageObject.sendKeys(RadioGroupPageObject.getRadioButton('First'), [Keys.ARROW_DOWN]);

    /* Validate the RadioButton is selected */
    expect(
      await RadioGroupPageObject.waitForRadioButtonSelected(
        'Second',
        'Pressed "Down Arrow" on the first RadioButton, but the second RadioButton failed to be selected.',
      ),
    ).toBeTruthy();

    expect(await RadioGroupPageObject.didAssertPopup())
      .withContext(RadioGroupPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press forward "Arrow Key" on a RadioButton adjacent to a disabled RadioButton. Validate disabled RadioButton is skipped.', async () => {
    // Presses the ArrowDown key while the second (B) RadioButton is selected
    await RadioGroupPageObject.sendKeys(RadioGroupPageObject.getRadioButton('Second'), [Keys.ARROW_DOWN]);

    /* Validate the RadioButton is selected */
    expect(
      await RadioGroupPageObject.waitForRadioButtonSelected(
        'Fourth',
        'Pressed "Down Arrow" on the second RadioButton, but the fourth RadioButton failed to be selected. The third RadioButton is disabled so it should be skipped.',
      ),
    ).toBeTruthy(); // It should skip RadioButton 3 since it is disabled

    expect(await RadioGroupPageObject.didAssertPopup())
      .withContext(RadioGroupPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
