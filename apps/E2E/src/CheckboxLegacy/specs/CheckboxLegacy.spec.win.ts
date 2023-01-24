import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxLegacyPageObject, { CheckboxSelector } from '../pages/CheckboxLegacyPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

describe('Checkbox Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Checkbox Legacy test page', async () => {
    await CheckboxLegacyPageObject.navigateToPageAndLoadTests(true);

    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Checkbox Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxLegacyPageObject.scrollToTestElement();
  });

  it('Checkbox - Validate accessibilityRole is correct', async () => {
    await expect(await CheckboxLegacyPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Checkbox - Set accessibilityLabel', async () => {
    await expect(await CheckboxLegacyPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CHECKBOX_ACCESSIBILITY_LABEL);
    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
    await expect(await CheckboxLegacyPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(CHECKBOX_TEST_COMPONENT_LABEL);
    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Legacy Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxLegacyPageObject.scrollToTestElement();

    await CheckboxLegacyPageObject.toggleCheckboxToUnchecked();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxLegacyPageObject.isCheckboxChecked()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    await CheckboxLegacyPageObject.clickComponent();
    await CheckboxLegacyPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    await expect(await CheckboxLegacyPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    await expect(await CheckboxLegacyPageObject.isCheckboxChecked()).toBeTruthy();

    await CheckboxLegacyPageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    await expect(await CheckboxLegacyPageObject.isCheckboxChecked()).toBeFalsy();
    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Click the "SPACE" on a Checkbox and verify it toggles', async () => {
    /* Presses the "space bar" to select the Checkbox */
    await CheckboxLegacyPageObject.sendKey(CheckboxSelector.Primary, Keys.SPACE);
    await CheckboxLegacyPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    /* Validate the Checkbox is selected */
    await expect(await CheckboxLegacyPageObject.isCheckboxChecked()).toBeTruthy();
    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
