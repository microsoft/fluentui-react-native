import { AndroidAttribute, ANDROID_CHECKBOX } from '../../common/consts';
import { CHECKBOXV1_TEST_COMPONENT } from '../consts';
import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await CheckboxV1PageObject.waitForInitialPageToDisplay();
    expect(await CheckboxV1PageObject.isInitialPageDisplayed()).toBeTruthy(CheckboxV1PageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    await CheckboxV1PageObject.navigateToPageAndLoadTests(true);
    expect(await CheckboxV1PageObject.isPageLoaded()).toBeTruthy(CheckboxV1PageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('CheckboxV1 Accessibility Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page */
  beforeEach(async () => {
    await CheckboxV1PageObject.mobileScrollToTestElement();
  });

  it('CheckboxV1 - Verify accessibilityLabel', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(
        CheckboxV1PageObject._primaryComponent,
        AndroidAttribute.AccessibilityLabel,
        CHECKBOXV1_TEST_COMPONENT,
      ),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Checkbox Class on Android', async () => {
    await expect(
      await CheckboxV1PageObject.compareAttribute(CheckboxV1PageObject._primaryComponent, AndroidAttribute.Class, ANDROID_CHECKBOX),
    ).toBeTruthy();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('CheckboxV1 Functional Testing', () => {
  /* Scrolls and waits for the Checkbox to be visible on the Test Page AND un-checks the Checkbox */
  beforeEach(async () => {
    await CheckboxV1PageObject.mobileScrollToTestElement();
  });

  it("Click on a Checkbox -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Checkbox is initially toggled OFF */
    await expect(await CheckboxV1PageObject.isCheckboxCheckedAndroid()).toBeFalsy();

    /* Click on the Checkbox to toggle on */
    await CheckboxV1PageObject.click(CheckboxV1PageObject._primaryComponent);

    expect(await CheckboxV1PageObject.didOnChangeCallbackFire('Callback failed to fire via click.')).toBeTruthy();

    /* Validate the Checkbox is toggled ON */
    expect(await CheckboxV1PageObject.isCheckboxCheckedAndroid()).toBeTruthy();

    await CheckboxV1PageObject.click(CheckboxV1PageObject._primaryComponent);

    /* Validate the Checkbox is toggled OFF */
    expect(await CheckboxV1PageObject.isCheckboxCheckedAndroid()).toBeFalsy();
    expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
