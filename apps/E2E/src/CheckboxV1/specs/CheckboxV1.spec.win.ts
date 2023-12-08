import { CHECKBOX_A11Y_ROLE, Keys, Attribute, AttributeValue } from '../../common/consts';
import { CHECKBOXV1_TEST_COMPONENT_LABEL, CHECKBOXV1_ACCESSIBILITY_LABEL } from '../consts';
import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CheckboxV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    expect(await CheckboxV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await CheckboxV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await CheckboxV1PageObject.didAssertPopup()).withContext(CheckboxV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped u.toBeFalsy()p
  });
});

describe('CheckboxV1 Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Checkbox".', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(CheckboxV1PageObject._primaryComponent, Attribute.AccessibilityRole, CHECKBOX_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOXV1_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the checkbox label.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOXV1_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Set "required" prop. Validate "IsRequiredForForm" element attribute is true.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._secondaryComponent,
        Attribute.IsRequiredForForm,
        AttributeValue.true,
      ),
    ).toBeTruthy();
  });

  it('Do NOT set "required" prop. Validate "IsRequiredForForm" element attribute is false.', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._primaryComponent,
        Attribute.IsRequiredForForm,
        AttributeValue.false,
      ),
    ).toBeTruthy();
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
    await expect(await CheckboxV1PageObject.isCheckboxChecked())
      .withContext('The primary checkbox should initially be toggled off.')
      .toBeFalsy();

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

    await expect(await CheckboxV1PageObject.didAssertPopup())
      .withContext(CheckboxV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it("Press 'Space' on the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxV1PageObject.isCheckboxChecked())
      .withContext('The primary checkbox should initially be toggled off.')
      .toBeFalsy();

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

    await expect(await CheckboxV1PageObject.didAssertPopup())
      .withContext(CheckboxV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
