import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupExperimentalPageObject, { RadioSelector } from '../pages/RadioGroupExperimentalPageObject';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, Attribute } from '../../common/consts';
import {
  EXPERIMENTAL_RADIOGROUP_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_RADIOGROUP_TEST_COMPONENT_LABEL,
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  SECOND_RADIO_LABEL,
} from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/Radio Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to RadioGroup test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToRadioGroupExperimentalPage();
    await RadioGroupExperimentalPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await RadioGroupExperimentalPageObject.isPageLoaded()).toBeTruthy(RadioGroupExperimentalPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroup/Radio Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupExperimentalPageObject.scrollToTestElement();
  });

  it("Validate RadioGroup's accessibilityRole is correct", async () => {
    await expect(
      await RadioGroupExperimentalPageObject.compareAttribute(
        RadioGroupExperimentalPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        RADIOGROUP_A11Y_ROLE,
      ),
    ).toBeTrue();

    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate Radio's accessibilityRole is correct", async () => {
    await expect(
      await RadioGroupExperimentalPageObject.compareAttribute(
        RadioGroupExperimentalPageObject.getRadio(RadioSelector.First),
        Attribute.AccessibilityRole,
        RADIOBUTTON_A11Y_ROLE,
      ),
    ).toBeTrue();

    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioGroup - Set accessibilityLabel', async () => {
    await expect(
      await RadioGroupExperimentalPageObject.compareAttribute(
        RadioGroupExperimentalPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_RADIOGROUP_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioGroup - Do not set accessibilityLabel -> Default to RadioGroup label', async () => {
    await expect(
      await RadioGroupExperimentalPageObject.compareAttribute(
        RadioGroupExperimentalPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_RADIOGROUP_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Radio - Set accessibilityLabel', async () => {
    await expect(
      await RadioGroupExperimentalPageObject.compareAttribute(
        RadioGroupExperimentalPageObject.getRadio(RadioSelector.First),
        Attribute.AccessibilityLabel,
        FIRST_RADIO_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Radio - Do not set accessibilityLabel -> Default to RadioButton label', async () => {
    await expect(
      await RadioGroupExperimentalPageObject.compareAttribute(
        RadioGroupExperimentalPageObject.getRadio(RadioSelector.Second),
        Attribute.AccessibilityLabel,
        SECOND_RADIO_LABEL,
      ),
    ).toBeTrue();

    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroup Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupExperimentalPageObject.scrollToTestElement();

    await RadioGroupExperimentalPageObject.resetRadioGroupSelection();
  });

  it('Click on a Radio and ensure it changes state from unselected -> selected', async () => {
    /* Validate the Radio is not initially selected */
    await expect(await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second)).toBeFalsy();

    /* Click on the Radio to select it */
    await RadioGroupExperimentalPageObject.click(RadioGroupExperimentalPageObject.getRadio(RadioSelector.Second));

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboard to Radio and check for Selection state', async () => {
    // Presses the ArrowDown key while the first (A) Radio is selected
    await RadioGroupExperimentalPageObject.sendKeys(RadioGroupExperimentalPageObject.getRadio(RadioSelector.First), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Keyboard to DISABLED Radio and validate it doesn't get selected", async () => {
    // Presses the ArrowDown key while the second (B) Radio is selected
    await RadioGroupExperimentalPageObject.sendKeys(RadioGroupExperimentalPageObject.getRadio(RadioSelector.Second), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Fourth)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate circular navigation', async () => {
    // Presses the ArrowDown key while the fourth (D) Radio is selected
    await RadioGroupExperimentalPageObject.sendKeys(RadioGroupExperimentalPageObject.getRadio(RadioSelector.Fourth), [Keys.ARROW_DOWN]);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.First)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate tab out of RadioGroup', async () => {
    // Presses the Tab key while the second (B) Radio is selected in first RadioGroup
    await RadioGroupExperimentalPageObject.sendKeys(RadioGroupExperimentalPageObject.getRadio(RadioSelector.Second), [Keys.TAB]);

    /* Validate the Radio is not focused */
    await expect(await RadioGroupExperimentalPageObject.waitForRadioFocused(RadioSelector.Fifth)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});
