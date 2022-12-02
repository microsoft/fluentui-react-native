import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxPageObject from '../pages/CheckboxPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { CHECKBOX_TEST_COMPONENT_LABEL, CHECKBOX_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/Checkbox/consts';
import { CHECKBOX_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('Checkbox Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Checkbox test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxPage();
    await CheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxPageObject.isPageLoaded()).toBeTruthy();
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
  });

  it('Checkbox - Set accessibilityLabel', async () => {
    await expect(await CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CHECKBOX_ACCESSIBILITY_LABEL);
  });

  it('Checkbox - Do not set accessibilityLabel -> Default to Checkbox label', async () => {
    await expect(await CheckboxPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(CHECKBOX_TEST_COMPONENT_LABEL);
  });
});

/* These currently don't work on UWP because element.isSelected() always returns false. I will need to debug and figure
 * out why this isn't supported on UWP, and if there's a potential workaround. Task #5747337 */
// describe('Checkbox Functional Testing', () => {
//   /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
//   beforeEach(() => {
//     CheckboxPageObject.scrollToTestElement();
//     CheckboxPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

//     CheckboxPageObject.toggleCheckboxToUnchecked();
//   });

//   it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", () => {
//     /* Validate the Checkbox is initially toggled OFF */
//     await expect(await CheckboxPageObject.isCheckboxChecked()).toBeFalsy();
//     console.log('Checkbox is checked: ' + CheckboxPageObject.isCheckboxChecked());

//     /* Click on the Checkbox to toggle on */
//     CheckboxPageObject.clickComponent();

//     CheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

//     await expect(await CheckboxPageObject.didOnChangeCallbackFire()).toBeTruthy();

//     /* Validate the Checkbox is toggled ON */
//     await expect(await CheckboxPageObject.isCheckboxChecked()).toBeTruthy();

//     CheckboxPageObject.clickComponent();

//     /* Validate the Checkbox is toggled OFF */
//     await expect(await CheckboxPageObject.isCheckboxChecked()).toBeFalsy();
//   });

//   it('Click the "Spacebar" on a Checkbox and verify it toggles', () => {
//     /* Presses the "space bar" to select the Checkbox */
//     CheckboxPageObject.sendKey(CHECKBOX_TEST_COMPONENT, Keys.Spacebar);
//     CheckboxPageObject.waitForCheckboxChecked(PAGE_TIMEOUT);

//     /* Validate the Checkbox is selected */
//     await expect(await CheckboxPageObject.isCheckboxChecked()).toBeTruthy();
//   });
// });
