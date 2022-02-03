import NavigateAppPage from '../../common/NavigateAppPage.win';
import CheckboxPageObject, { CheckboxSelector } from '../pages/CheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../../../FluentTester/TestComponents/Checkbox/consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

describe('Checkbox Testing Initialization', () => {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Checkbox test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    CheckboxPageObject.scrollToComponentButton();
    CheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToCheckboxPage();
    CheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(CheckboxPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('Checkbox Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(() => {
    CheckboxPageObject.scrollToTestElement();
    CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Checkbox - Validate accessibilityRole is correct', () => {
    expect(CheckboxPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
  });

  it('Checkbox - Set accessibilityLabel', () => {
    expect(CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CHECKBOX_ACCESSIBILITY_LABEL);
  });

  it('Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', () => {
    expect(CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(CHECKBOX_TEST_COMPONENT_LABEL);
  });
});

describe('Checkbox Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(() => {
    CheckboxPageObject.scrollToTestElement();
    CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    CheckboxPageObject.toggleCheckboxToUnchecked();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", () => {
    /* Validate the Checkbox is initially toggled OFF */
    expect(CheckboxPageObject.isCheckboxChecked()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    CheckboxPageObject.clickComponent();
    CheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    expect(CheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    expect(CheckboxPageObject.isCheckboxChecked()).toBeTruthy();

    CheckboxPageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    expect(CheckboxPageObject.isCheckboxChecked()).toBeFalsy();
  });

  it('Click the "Spacebar" on a Checkbox and verify it toggles', () => {
    /* Presses the "space bar" to select the Checkbox */
    CheckboxPageObject.sendKey(CheckboxSelector.Primary, Keys.Spacebar);
    CheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    /* Validate the Checkbox is selected */
    expect(CheckboxPageObject.isCheckboxChecked()).toBeTruthy();
  });
});
