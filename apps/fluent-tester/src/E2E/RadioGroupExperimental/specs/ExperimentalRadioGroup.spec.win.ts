import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupExperimentalPageObject, { RadioSelector } from '../pages/RadioGroupExperimentalPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { RADIOBUTTON_A11Y_ROLE, RADIOGROUP_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';
import {
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  SECOND_RADIO_LABEL,
} from '../../../TestComponents/RadioGroupExperimental/consts';

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
    await RadioGroupExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it("Validate RadioGroup's accessibilityRole is correct", async () => {
    await expect(await RadioGroupExperimentalPageObject.getAccessibilityRole()).toEqual(RADIOGROUP_A11Y_ROLE);
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate Radio's accessibilityRole is correct", async () => {
    await expect(await RadioGroupExperimentalPageObject.getRadioAccesibilityRole()).toEqual(RADIOBUTTON_A11Y_ROLE);
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioGroup - Set accessibilityLabel', async () => {
    await expect(await RadioGroupExperimentalPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      RADIOGROUP_ACCESSIBILITY_LABEL,
    );
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('RadioGroup - Do not set accessibilityLabel -> Default to RadioGroup label', async () => {
    await expect(await RadioGroupExperimentalPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      RADIOGROUP_TEST_COMPONENT_LABEL,
    );
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Radio - Set accessibilityLabel', async () => {
    await expect(await RadioGroupExperimentalPageObject.getRBAccessibilityLabel(RadioSelector.First)).toEqual(
      FIRST_RADIO_ACCESSIBILITY_LABEL,
    );
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Radio - Do not set accessibilityLabel -> Default to RadioButton label', async () => {
    await expect(await RadioGroupExperimentalPageObject.getRBAccessibilityLabel(RadioSelector.Second)).toEqual(SECOND_RADIO_LABEL);
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroup Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupExperimentalPageObject.scrollToTestElement();
    await RadioGroupExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await RadioGroupExperimentalPageObject.resetRadioGroupSelection();
  });

  it('Click on a Radio and ensure it changes state from unselected -> selected', async () => {
    /* Validate the Radio is not initially selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Second)).toBeFalsy();

    /* Click on the Radio to select it */
    await RadioGroupExperimentalPageObject.clickRadio(RadioSelector.Second);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second, PAGE_TIMEOUT);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Second)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboard to Radio and check for Selection state', async () => {
    // Presses the ArrowDown key while the first (A) Radio is selected
    await RadioGroupExperimentalPageObject.sendKey(Keys.ARROW_DOWN, RadioSelector.First);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second, 5000);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Second)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Keyboard to DISABLED Radio and validate it doesn't get selected", async () => {
    // Presses the ArrowDown key while the second (B) Radio is selected
    await RadioGroupExperimentalPageObject.sendKey(Keys.ARROW_DOWN, RadioSelector.Second);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Fourth, 5000); // It should skip RadioButton 3 since it is disabled

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Fourth)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate circular navigation', async () => {
    // Presses the ArrowDown key while the fourth (D) Radio is selected
    await RadioGroupExperimentalPageObject.sendKey(Keys.ARROW_DOWN, RadioSelector.Fourth);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.First, 5000); // It should go to first Radio to follow circular navigation

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.First)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate tab out of RadioGroup', async () => {
    // Presses the Tab key while the second (B) Radio is selected in first RadioGroup
    await RadioGroupExperimentalPageObject.sendKey(Keys.TAB, RadioSelector.Second);
    await RadioGroupExperimentalPageObject.waitForRadioFocused(RadioSelector.Fifth, 5000);

    /* Validate the Radio is not focused */
    await expect(await RadioGroupExperimentalPageObject.isRadioFocused(RadioSelector.Fifth)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});
