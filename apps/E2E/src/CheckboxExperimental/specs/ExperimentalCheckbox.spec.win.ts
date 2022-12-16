import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalCheckboxPageObject from '../pages/ExperimentalCheckboxPageObject';
import {
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
} from '../../../../fluent-tester/src/TestComponents/CheckboxExperimental/consts';
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

  it('Experimental Checkbox - Validate accessibilityRole is correct', async () => {
    await expect(
      await ExperimentalCheckboxPageObject.compareAttribute(
        ExperimentalCheckboxPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        CHECKBOX_A11Y_ROLE,
      ),
    ).toBeTrue();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Checkbox - Set accessibilityLabel', async () => {
    await expect(
      await ExperimentalCheckboxPageObject.compareAttribute(
        ExperimentalCheckboxPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
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

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy(
      'The primary checkbox should initially be toggled off.',
    );

    /* Click on the Checkbox to toggle on */
    await ExperimentalCheckboxPageObject.click(ExperimentalCheckboxPageObject._primaryComponent);
    await ExperimentalCheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy(
      'Primary checkbox failed to fire onChange() callback via click.',
    );

    /* Validate the Checkbox is toggled ON */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeTruthy('The primary checkbox should have been toggled on.');

    await ExperimentalCheckboxPageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should have been toggled off.');

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Press 'SPACE' on a Checkbox and verify it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy(
      'The primary checkbox should initially be toggled off.',
    );

    /* Presses the "space bar" to select the Checkbox */
    await ExperimentalCheckboxPageObject.sendKeys(ExperimentalCheckboxPageObject._primaryComponent, [Keys.SPACE]);
    await ExperimentalCheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy(
      "Primary checkbox failed to fire onChange() callback via 'Space' press.",
    );

    /* Validate the Checkbox is toggled ON */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeTruthy(
      "Primary checkbox should have been toggled on via 'Space' press.",
    );

    await ExperimentalCheckboxPageObject.sendKeys(ExperimentalCheckboxPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Checkbox is toggled OFF */
    await expect(await ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy('The primary checkbox should have been toggled off.');

    await expect(await ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});
