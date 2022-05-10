import NavigateAppPage from '../../common/NavigateAppPage.win';
import ExperimentalCheckboxPageObject, { ExperimentalCheckboxSelector } from '../pages/ExperimentalCheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import {
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
} from '../../../FluentTester/TestComponents/CheckboxExperimental/consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CHECKBOX_A11Y_ROLE, Keys } from '../../common/consts';

describe('Experimental Checkbox Testing Initialization', () => {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental Checkbox test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ExperimentalCheckboxPageObject.scrollToComponentButton();
    ExperimentalCheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToCheckboxExperimentalPage();
    ExperimentalCheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalCheckboxPageObject.isPageLoaded()).toBeTruthy(ExperimentalCheckboxPageObject.ERRORMESSAGE_PAGELOAD);
    expect(ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Checkbox Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(() => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Experimental Checkbox - Validate accessibilityRole is correct', () => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalCheckboxPageObject.getAccessibilityRole()).toEqual(CHECKBOX_A11Y_ROLE);
    expect(ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Checkbox - Set accessibilityLabel', () => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalCheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
    );
    expect(ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', () => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalCheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
    );
    expect(ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Checkbox Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(() => {
    ExperimentalCheckboxPageObject.scrollToTestElement();
    ExperimentalCheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    ExperimentalCheckboxPageObject.toggleCheckboxToUnchecked();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", () => {
    /* Validate the Checkbox is initially toggled OFF */
    expect(ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    ExperimentalCheckboxPageObject.clickComponent();
    ExperimentalCheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    expect(ExperimentalCheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    expect(ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeTruthy();

    ExperimentalCheckboxPageObject.clickComponent();

    /* Validate the Checkbox is toggled OFF */
    expect(ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeFalsy();
    expect(ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Click the "Spacebar" on a Checkbox and verify it toggles', () => {
    /* Presses the "space bar" to select the Checkbox */
    ExperimentalCheckboxPageObject.sendKey(ExperimentalCheckboxSelector.Primary, Keys.Spacebar);
    ExperimentalCheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

    /* Validate the Checkbox is selected */
    expect(ExperimentalCheckboxPageObject.isCheckboxChecked()).toBeTruthy();
    expect(ExperimentalCheckboxPageObject.didAssertPopup()).toBeFalsy(ExperimentalCheckboxPageObject.ERRORMESSAGE_ASSERT);
  });
});
