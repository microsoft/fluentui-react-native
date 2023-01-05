import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';
import { CHECKBOXV1_TEST_COMPONENT_LABEL, CHECKBOXV1_ACCESSIBILITY_LABEL } from '../consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CHECKBOX_A11Y_ROLE, Keys, Attribute } from '../../common/consts';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxV1Page();
    await CheckboxV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxV1PageObject.isPageLoaded()).toBeTruthy(CheckboxV1PageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('CheckboxV1 Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to Checkbox "ControlType" element attribute.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(CheckboxV1PageObject._primaryComponent, Attribute.AccessibilityRole, CHECKBOX_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOXV1_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the checkbox label.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOXV1_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('CheckboxV1 Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxV1PageObject.scrollToTestElement();

    await CheckboxV1PageObject.toggleCheckbox(false);
  });

  it("Click the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxV1PageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should initially be toggled off.');

    /* Click on the Checkbox to toggle on */
    await CheckboxV1PageObject.click(CheckboxV1PageObject._primaryComponent);

    /* Validate the Checkbox is toggled ON */
    await expect(
      await CheckboxV1PageObject.waitForCheckboxToggle(true, 'The primary checkbox should have been toggled on via click.'),
    ).toBeTruthy();

    await expect(
      await CheckboxV1PageObject.didOnChangeCallbackFire('Primary checkbox failed to fire onChange() callback via click.'),
    ).toBeTruthy();

    await CheckboxV1PageObject.click(CheckboxV1PageObject._primaryComponent);

    /* Validate the Checkbox is toggled OFF */
    await expect(
      await CheckboxV1PageObject.waitForCheckboxToggle(false, 'The primary checkbox should have been toggled off via click.'),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it("Press 'Space' on the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxV1PageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should initially be toggled off.');

    /* Presses the "space bar" to select the Checkbox */
    await CheckboxV1PageObject.sendKeys(CheckboxV1PageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled ON */
    await expect(
      await CheckboxV1PageObject.waitForCheckboxToggle(true, "Primary checkbox should have been toggled on via 'Space' press."),
    ).toBeTruthy();

    await expect(
      await CheckboxV1PageObject.didOnChangeCallbackFire("Primary checkbox failed to fire onChange() callback via 'Space' press."),
    ).toBeTruthy();
    await CheckboxV1PageObject.sendKeys(CheckboxV1PageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled OFF */
    await expect(
      await CheckboxV1PageObject.waitForCheckboxToggle(false, "The primary checkbox should have been toggled off via 'Space' press."),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
