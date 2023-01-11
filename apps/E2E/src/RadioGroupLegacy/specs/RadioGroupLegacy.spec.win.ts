import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupPageObject, { RadioButton } from '../pages/RadioGroupLegacyPageObject';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, Attribute } from '../../common/consts';
import {
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
  SECOND_RADIO_BUTTON_LABEL,
} from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to RadioGroup Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToRadioGroupLegacyPage();
    await RadioGroupPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await RadioGroupPageObject.isPageLoaded()).toBeTruthy(RadioGroupPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroup/RadioButton Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupPageObject.scrollToTestElement(await RadioGroupPageObject._firstRadioGroup);
  });

  it('Validate RadioGroup\'s "accessibilityRole" defaults to List "ControlType" element attribute.', async () => {
    await expect(
      await RadioGroupPageObject.compareAttribute(RadioGroupPageObject._firstRadioGroup, Attribute.AccessibilityRole, RADIOGROUP_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate RadioButton\'s "accessibilityRole" defaults to RadioButton "ControlType" element attribute.', async () => {
    await expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject.getRadioButton(RadioButton.First),
        Attribute.AccessibilityRole,
        RADIOBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set RadioGroup "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject._firstRadioGroup,
        Attribute.AccessibilityLabel,
        RADIOGROUP_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set RadioGroup "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioGroup label.', async () => {
    await expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject._secondRadioGroup,
        Attribute.AccessibilityLabel,
        RADIOGROUP_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set RadioButton "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject.getRadioButton(RadioButton.First),
        Attribute.AccessibilityLabel,
        FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set RadioButton "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioButton label.', async () => {
    await expect(
      await RadioGroupPageObject.compareAttribute(
        RadioGroupPageObject.getRadioButton(RadioButton.Second),
        Attribute.AccessibilityLabel,
        SECOND_RADIO_BUTTON_LABEL,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroup Legacy Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st RadioButton in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupPageObject.scrollToTestElement(await RadioGroupPageObject._firstRadioGroup);

    await RadioGroupPageObject.resetRadioGroupSelection();
  });

  it('Click on a RadioButton. Validate that it changes state from unselected to selected.', async () => {
    /* Validate the RadioButton is not initially selected */
    await expect(await RadioGroupPageObject.isRadioButtonSelected(RadioButton.Second)).toBeFalsy(
      'Expected the first RadioButton to be initially selected, but the second RadioButton was initially selected.',
    );

    /* Click on the RadioButton to select it */
    await RadioGroupPageObject.click(RadioGroupPageObject.getRadioButton(RadioButton.Second));

    /* Validate the RadioButton is selected */
    await expect(
      await RadioGroupPageObject.waitForRadioButtonSelected(
        RadioButton.Second,
        'Clicked the second RadioButton, but it failed to be selected.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press forward "Arrow Key" on a RadioButton. Validate adjacent RadioButton is newly selected.', async () => {
    // Presses the ArrowDown key while the first (A) RadioButton is selected
    await RadioGroupPageObject.sendKeys(RadioGroupPageObject.getRadioButton(RadioButton.First), [Keys.ARROW_DOWN]);

    /* Validate the RadioButton is selected */
    await expect(
      await RadioGroupPageObject.waitForRadioButtonSelected(
        RadioButton.Second,
        'Pressed "Down Arrow" on the first RadioButton, but the second RadioButton failed to be selected.',
      ),
    ).toBeTruthy();

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press forward "Arrow Key" on a RadioButton adjacent to a disabled RadioButton. Validate disabled RadioButton is skipped.', async () => {
    // Presses the ArrowDown key while the second (B) RadioButton is selected
    await RadioGroupPageObject.sendKeys(RadioGroupPageObject.getRadioButton(RadioButton.Second), [Keys.ARROW_DOWN]);

    /* Validate the RadioButton is selected */
    await expect(
      await RadioGroupPageObject.waitForRadioButtonSelected(
        RadioButton.Fourth,
        'Pressed "Down Arrow" on the second RadioButton, but the fourth RadioButton failed to be selected. The third RadioButton is disabled so it should be skipped.',
      ),
    ).toBeTruthy(); // It should skip RadioButton 3 since it is disabled

    await expect(await RadioGroupPageObject.didAssertPopup()).toBeFalsy(RadioGroupPageObject.ERRORMESSAGE_ASSERT);
  });
});
