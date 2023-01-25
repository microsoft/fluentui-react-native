import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxLegacyPageObject from '../pages/CheckboxLegacyPageObject';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, Attribute } from '../../common/consts';

describe('Checkbox Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Checkbox Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxLegacyPage();
    await CheckboxLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxLegacyPageObject.isPageLoaded()).toBeTruthy(CheckboxLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Checkbox Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxLegacyPageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Checkbox".', async () => {
    await expect(
      await CheckboxLegacyPageObject.compareAttribute(
        CheckboxLegacyPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        CHECKBOX_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await CheckboxLegacyPageObject.compareAttribute(
        CheckboxLegacyPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOX_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the checkbox label.', async () => {
    await expect(
      await CheckboxLegacyPageObject.compareAttribute(
        CheckboxLegacyPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOX_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();

    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Legacy Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxLegacyPageObject.scrollToTestElement();

    await CheckboxLegacyPageObject.toggleCheckbox(false);
  });

  it("Click the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxLegacyPageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should initially be toggled off.');

    /* Click on the Checkbox to toggle on */
    await CheckboxLegacyPageObject.click(CheckboxLegacyPageObject._primaryComponent);

    /* Validate the Checkbox is toggled ON */
    await expect(
      await CheckboxLegacyPageObject.waitForCheckboxToggle(true, 'The primary checkbox should have been toggled on via click.'),
    ).toBeTruthy();

    await expect(
      await CheckboxLegacyPageObject.didOnChangeCallbackFire('Primary checkbox failed to fire onChange() callback via click.'),
    ).toBeTruthy();

    await CheckboxLegacyPageObject.click(CheckboxLegacyPageObject._primaryComponent);

    /* Validate the Checkbox is toggled OFF */
    await expect(
      await CheckboxLegacyPageObject.waitForCheckboxToggle(false, 'The primary checkbox should have been toggled off via click.'),
    ).toBeTruthy();

    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Press 'Space' on the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxLegacyPageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should initially be toggled off.');

    /* Presses the "space bar" to select the Checkbox */
    await CheckboxLegacyPageObject.sendKeys(CheckboxLegacyPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled ON */
    await expect(
      await CheckboxLegacyPageObject.waitForCheckboxToggle(true, "Primary checkbox should have been toggled on via 'Space' press."),
    ).toBeTruthy();

    await expect(
      await CheckboxLegacyPageObject.didOnChangeCallbackFire("Primary checkbox failed to fire onChange() callback via 'Space' press."),
    ).toBeTruthy();
    await CheckboxLegacyPageObject.sendKeys(CheckboxLegacyPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled OFF */
    await expect(
      await CheckboxLegacyPageObject.waitForCheckboxToggle(false, "The primary checkbox should have been toggled off via 'Space' press."),
    ).toBeTruthy();

    await expect(await CheckboxLegacyPageObject.didAssertPopup()).toBeFalsy(CheckboxLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
