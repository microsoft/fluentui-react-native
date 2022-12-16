import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxPageObject from '../pages/CheckboxPageObject';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/Checkbox/consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, Attribute } from '../../common/consts';

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
  });

  it('Checkbox - Validate accessibilityRole is correct', async () => {
    await expect(
      await CheckboxPageObject.compareAttribute(CheckboxPageObject._primaryComponent, Attribute.AccessibilityRole, CHECKBOX_A11Y_ROLE),
    ).toBeTrue();

    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Checkbox - Set accessibilityLabel', async () => {
    await expect(
      await CheckboxPageObject.compareAttribute(
        CheckboxPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOX_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
    await expect(
      await CheckboxPageObject.compareAttribute(
        CheckboxPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        CHECKBOX_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxPageObject.scrollToTestElement();

    await CheckboxPageObject.toggleCheckbox(false);
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxPageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should initially be toggled off.');

    /* Click on the Checkbox to toggle on */
    await CheckboxPageObject.click(CheckboxPageObject._primaryComponent);

    /* Validate the Checkbox is toggled ON */
    await expect(await CheckboxPageObject.waitForCheckboxToggle(true)).toBeTruthy(
      'The primary checkbox should have been toggled on via click.',
    );

    await expect(await CheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy(
      'Primary checkbox failed to fire onChange() callback via click.',
    );

    await CheckboxPageObject.click(CheckboxPageObject._primaryComponent);

    /* Validate the Checkbox is toggled OFF */
    await expect(await CheckboxPageObject.waitForCheckboxToggle(false)).toBeTruthy(
      'The primary checkbox should have been toggled off via click.',
    );

    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Press 'SPACE' on a Checkbox and verify it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxPageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should initially be toggled off.');

    /* Presses the "space bar" to select the Checkbox */
    await CheckboxPageObject.sendKeys(CheckboxPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled ON */
    await expect(await CheckboxPageObject.waitForCheckboxToggle(true)).toBeTruthy(
      "Primary checkbox should have been toggled on via 'Space' press.",
    );

    await expect(await CheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy(
      "Primary checkbox failed to fire onChange() callback via 'Space' press.",
    );
    await CheckboxPageObject.sendKeys(CheckboxPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled OFF */
    await expect(await CheckboxPageObject.waitForCheckboxToggle(false)).toBeTruthy(
      "The primary checkbox should have been toggled off via 'Space' press.",
    );

    await expect(await CheckboxPageObject.didAssertPopup()).toBeFalsy(CheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});
