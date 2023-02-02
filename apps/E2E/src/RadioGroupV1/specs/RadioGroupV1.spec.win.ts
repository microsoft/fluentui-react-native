import { Attribute, BOOT_APP_TIMEOUT, Keys, PAGE_TIMEOUT, RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE } from '../../common/consts';
import NavigateAppPage from '../../common/NavigateAppPage';
import {
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  RADIOGROUPV1_ACCESSIBILITY_LABEL,
  RADIOGROUPV1_TEST_COMPONENT_LABEL,
  SECOND_RADIO_LABEL,
} from '../consts';
import RadioGroupV1Page from '../pages/RadioGroupV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroupV1/RadioV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to RadioGroupV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToRadioGroupV1Page();
    await RadioGroupV1Page.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(await RadioGroupV1Page.isPageLoaded()).toBeTruthy(RadioGroupV1Page.ERRORMESSAGE_PAGELOAD);
    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroupV1/RadioV1 Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupV1Page.scrollToTestElement();
  });

  it('Validate RadioGroup\'s "accessibilityRole" defaults to "List.ControlType".', async () => {
    expect(
      await RadioGroupV1Page.compareAttribute(RadioGroupV1Page._primaryComponent, Attribute.AccessibilityRole, RADIOGROUP_A11Y_ROLE),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Validate Radio\'s "accessibilityRole" defaults to "RadioButton.ControlType".', async () => {
    expect(
      await RadioGroupV1Page.compareAttribute(RadioGroupV1Page.getRadio('First'), Attribute.AccessibilityRole, RADIOBUTTON_A11Y_ROLE),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Set RadioGroup "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await RadioGroupV1Page.compareAttribute(
        RadioGroupV1Page._primaryComponent,
        Attribute.AccessibilityLabel,
        RADIOGROUPV1_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Do not set RadioGroup "accessibilityLabel" prop. Validate "Name" element attribute defaults to current RadioGroup label.', async () => {
    expect(
      await RadioGroupV1Page.compareAttribute(
        RadioGroupV1Page._secondaryComponent,
        Attribute.AccessibilityLabel,
        RADIOGROUPV1_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Set Radio "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await RadioGroupV1Page.compareAttribute(
        RadioGroupV1Page.getRadio('First'),
        Attribute.AccessibilityLabel,
        FIRST_RADIO_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Do not set Radio "accessibilityLabel" prop. Validate "Name" element attribute defaults to current Radio label.', async () => {
    expect(
      await RadioGroupV1Page.compareAttribute(RadioGroupV1Page.getRadio('Second'), Attribute.AccessibilityLabel, SECOND_RADIO_LABEL),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroupV1 Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupV1Page.scrollToTestElement();

    await RadioGroupV1Page.resetRadioGroupSelection();
  });

  it('Click on a Radio. Validate that it changes state from unselected to selected.', async () => {
    /* Validate the Radio is not initially selected */
    expect(await RadioGroupV1Page.isRadioSelected('Second')).toBeFalsy(
      'Expected radio #2 to be unselected at test start, but #2 was initially selected.',
    );

    /* Click on the Radio to select it */
    await RadioGroupV1Page.click(RadioGroupV1Page.getRadio('Second'));

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1Page.waitForRadioSelected('Second', 'Expected radio #2 to be selected by click, but #2 remained unselected.'),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Navigate to unselected radio using "DOWN ARROW" key. Validate state changes from unselected to selected.', async () => {
    // Presses the ArrowDown key while the first (A) Radio is selected
    await RadioGroupV1Page.sendKeys(RadioGroupV1Page.getRadio('First'), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1Page.waitForRadioSelected('Second', 'Expected radio #2 to be selected by a "DOWN ARROW" input from radio #1.'),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Navigate to unselected radio using "DOWN ARROW" key. Validate disabled Radio is skipped.', async () => {
    // Presses the ArrowDown key while the second (B) Radio is selected
    await RadioGroupV1Page.sendKeys(RadioGroupV1Page.getRadio('Second'), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1Page.waitForRadioSelected(
        'Fourth',
        'Expected radio #4 to be selected by a "DOWN ARROW" input from radio #2 and radio #3 (disabled) to be skipped.',
      ),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Press "DOWN ARROW" on the last Radio of a RadioGroup. Validate circular navigation functions correctly.', async () => {
    // Presses the ArrowDown key while the fourth (D) Radio is selected
    await RadioGroupV1Page.sendKeys(RadioGroupV1Page.getRadio('Fourth'), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    expect(
      await RadioGroupV1Page.waitForRadioSelected('First', 'Expected radio #1 to be selected by a "DOWN ARROW" input from radio #4.'),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });

  it('Press "TAB" on a Radio. Validate Radio in the next RadioGroup is focused.', async () => {
    // Presses the Tab key while the second (B) Radio is selected in first RadioGroup
    await RadioGroupV1Page.sendKeys(RadioGroupV1Page.getRadio('Second'), [Keys.TAB]);

    /* Validate the Radio is not focused */
    expect(
      await RadioGroupV1Page.waitForRadioFocused('Fifth', 'Expected radio #5 to be focused by a "TAB" input from previous radio group.'),
    ).toBeTruthy();

    expect(await RadioGroupV1Page.didAssertPopup()).toBeFalsy(RadioGroupV1Page.ERRORMESSAGE_ASSERT);
  });
});
