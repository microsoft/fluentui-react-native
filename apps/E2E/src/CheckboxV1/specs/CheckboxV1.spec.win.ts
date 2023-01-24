import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';
import { ComponentSelector } from '../../common/BasePage';
import { CHECKBOXV1_TEST_COMPONENT_LABEL, CHECKBOXV1_ACCESSIBILITY_LABEL } from '../consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CHECKBOX_A11Y_ROLE, Keys } from '../../common/consts';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    await CheckboxV1PageObject.navigateToPageAndLoadTests(true);

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('CheckboxV1 Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxV1PageObject.scrollToTestElement();
  });

  it('CheckboxV1 - Validate accessibilityRole is correct', async () => {
    await expect(await CheckboxV1PageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('CheckboxV1 - Set accessibilityLabel', async () => {
    await expect(await CheckboxV1PageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CHECKBOXV1_ACCESSIBILITY_LABEL);
    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('CheckboxV1 - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
    await expect(await CheckboxV1PageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(CHECKBOXV1_TEST_COMPONENT_LABEL);
    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('CheckboxV1 Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxV1PageObject.scrollToTestElement();

    await CheckboxV1PageObject.toggleCheckboxToUnchecked();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxV1PageObject.isCheckboxChecked()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    await CheckboxV1PageObject.clickComponent();
    await CheckboxV1PageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    expect(await CheckboxV1PageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    expect(await CheckboxV1PageObject.isCheckboxChecked()).toBeTruthy();

    await CheckboxV1PageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    expect(await CheckboxV1PageObject.isCheckboxChecked()).toBeFalsy();
    expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Click the "SPACE" on a Checkbox and verify it toggles', async () => {
    /* Presses the "space bar" to select the Checkbox */
    await CheckboxV1PageObject.sendKey(ComponentSelector.Primary, Keys.SPACE);
    await CheckboxV1PageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    /* Validate the Checkbox is selected */
    await expect(await CheckboxV1PageObject.isCheckboxChecked()).toBeTruthy();
    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
