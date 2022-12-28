import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalCheckboxPageObject from '../pages/ExperimentalCheckboxPageObject';
import { EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL, EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL } from '../consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CHECKBOX_A11Y_ROLE, Keys, Attribute } from '../../common/consts';

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
  });

  it('Validate "accessibilityRole" defaults to Checkbox "ControlType" element attribute.', async () => {
    await expect(
      await ExperimentalCheckboxPageObject.compareAttribute(
        ExperimentalCheckboxPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        CHECKBOX_A11Y_ROLE,
      ),
    ).toBeTrue();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await ExperimentalCheckboxPageObject.compareAttribute(
        ExperimentalCheckboxPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "accessibilityLabel" value defaults to the checkbox label.', async () => {
    await expect(
      await ExperimentalCheckboxPageObject.compareAttribute(
        ExperimentalCheckboxPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await ExperimentalCheckboxPageObject.scrollToTestElement();

    await ExperimentalCheckboxPageObject.toggleCheckbox(false);
  });

  it("Click the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy(
      'The primary checkbox should initially be toggled off.',
    );

    /* Click on the Checkbox to toggle on */
    await ExperimentalCheckboxPageObject.click(ExperimentalCheckboxPageObject._primaryComponent);

    /* Validate the Checkbox is toggled ON */
    await expect(
      await ExperimentalCheckboxPageObject.waitForCheckboxToggle(true, 'The primary checkbox should have been toggled on via click.'),
    ).toBeTruthy();

    await expect(
      await ExperimentalCheckboxPageObject.didOnChangeCallbackFire('Primary checkbox failed to fire onChange() callback via click.'),
    ).toBeTruthy();

    await ExperimentalCheckboxPageObject.click(ExperimentalCheckboxPageObject._primaryComponent);

    /* Validate the Checkbox is toggled OFF */
    await expect(
      await ExperimentalCheckboxPageObject.waitForCheckboxToggle(false, 'The primary checkbox should have been toggled off via click.'),
    ).toBeTruthy();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Press 'Space' on the primary checkbox. Validate that the Checkbox toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy(
      'The primary checkbox should initially be toggled off.',
    );

    /* Presses the "space bar" to select the Checkbox */
    await ExperimentalCheckboxPageObject.sendKeys(ExperimentalCheckboxPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled ON */
    await expect(
      await ExperimentalCheckboxPageObject.waitForCheckboxToggle(true, "Primary checkbox should have been toggled on via 'Space' press."),
    ).toBeTruthy();

    await expect(
      await ExperimentalCheckboxPageObject.didOnChangeCallbackFire(
        "Primary checkbox failed to fire onChange() callback via 'Space' press.",
      ),
    ).toBeTruthy();
    await ExperimentalCheckboxPageObject.sendKeys(ExperimentalCheckboxPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled OFF */
    await expect(
      await ExperimentalCheckboxPageObject.waitForCheckboxToggle(
        false,
        "The primary checkbox should have been toggled off via 'Space' press.",
      ),
    ).toBeTruthy();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});
