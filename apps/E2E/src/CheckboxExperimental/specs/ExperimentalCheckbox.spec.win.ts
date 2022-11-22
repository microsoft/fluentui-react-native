import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalCheckboxPageObject, { ExperimentalCheckboxSelector } from '../pages/ExperimentalCheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage';
import {
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
} from '../../../../fluent-tester/src/TestComponents/CheckboxExperimental/consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CHECKBOX_A11Y_ROLE, Keys } from '../../common/consts';

describe('Experimental Checkbox Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental Checkbox test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxExperimentalPage();
    await ExperimentalCheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.isPageLoaded()).toBeTruthy(ExperimentalCheckboxPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Checkbox Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await ExperimentalCheckboxPageObject.scrollToTestElement();
    await ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Experimental Checkbox - Validate accessibilityRole is correct', async () => {
    await ExperimentalCheckboxPageObject.scrollToTestElement();
    await ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Checkbox - Set accessibilityLabel', async () => {
    await ExperimentalCheckboxPageObject.scrollToTestElement();
    await ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
    );
    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
    await ExperimentalCheckboxPageObject.scrollToTestElement();
    await ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
    );
    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await ExperimentalCheckboxPageObject.scrollToTestElement();
    await ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await ExperimentalCheckboxPageObject.toggleCheckboxToUnchecked();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    await ExperimentalCheckboxPageObject.clickComponent();
    await ExperimentalCheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    expect(await ExperimentalCheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeTruthy();

    await ExperimentalCheckboxPageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy();
    expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Click the "SPACE" on a Checkbox and verify it toggles', async () => {
    /* Presses the "space bar" to select the Checkbox */
    await ExperimentalCheckboxPageObject.sendKey(ExperimentalCheckboxSelector.Primary, Keys.SPACE);
    await ExperimentalCheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    /* Validate the Checkbox is selected */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeTruthy();
    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});
