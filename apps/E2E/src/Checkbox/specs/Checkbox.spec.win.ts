import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxPageObject, { CheckboxSelector } from '../pages/CheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/Checkbox/consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

describe('Checkbox Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Checkbox test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxPage();
    await CheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxPageObject.isPageLoaded()).toBeTruthy(CheckboxPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Checkbox Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxPageObject.scrollToTestElement();
    await CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Checkbox - Validate accessibilityRole is correct', async () => {
    await expect(await CheckboxPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Checkbox - Set accessibilityLabel', async () => {
    await expect(await CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CHECKBOX_ACCESSIBILITY_LABEL);
    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
    await expect(await CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(CHECKBOX_TEST_COMPONENT_LABEL);
    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxPageObject.scrollToTestElement();
    await CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await CheckboxPageObject.toggleCheckboxToUnchecked();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxPageObject.isCheckboxChecked()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    await CheckboxPageObject.clickComponent();
    await CheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    await expect(await CheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    await expect(await CheckboxPageObject.isCheckboxChecked()).toBeTruthy();

    await CheckboxPageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    await expect(await CheckboxPageObject.isCheckboxChecked()).toBeFalsy();
    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Click the "SPACE" on a Checkbox and verify it toggles', async () => {
    /* Presses the "space bar" to select the Checkbox */
    await CheckboxPageObject.sendKey(CheckboxSelector.Primary, Keys.SPACE);
    await CheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    /* Validate the Checkbox is selected */
    await expect(await CheckboxPageObject.isCheckboxChecked()).toBeTruthy();
    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});
