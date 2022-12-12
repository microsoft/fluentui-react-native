import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonExperimentalPageObject, { ButtonSelector } from '../pages/ButtonExperimentalPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../../../fluent-tester/src/TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Button Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonExperimentalPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonExperimentalPageObject.isPageLoaded()).toBeTruthy(ButtonExperimentalPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Button Accessibility Testing', async () => {
  beforeEach(async () => {
    await ButtonExperimentalPageObject.scrollToTestElement();
  });

  it('Experimental Button - Validate accessibilityRole is correct', async () => {
    await expect(await ButtonExperimentalPageObject.accessibilityRoleIsEqualTo(ButtonSelector.PrimaryButton, BUTTON_A11Y_ROLE)).toBeTrue();

    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Button - Set accessibilityLabel', async () => {
    await expect(
      await ButtonExperimentalPageObject.accessibilityLabelIsEqualTo(ButtonSelector.PrimaryButton, BUTTON_ACCESSIBILITY_LABEL),
    ).toBeTrue();

    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Button - Do not set accessibilityLabel -> Default to Button label', async () => {
    await expect(
      await ButtonExperimentalPageObject.accessibilityLabelIsEqualTo(ButtonSelector.SecondaryButton, BUTTON_TEST_COMPONENT_LABEL),
    ).toBeTrue();

    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Experimental Button Functional Testing', async () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonExperimentalPageObject.scrollToTestElement();
  });

  it('Validate OnClick() callback was fired -> Click', async () => {
    await ButtonExperimentalPageObject.clickComponent();
    await expect(await ButtonExperimentalPageObject.didOnClickCallbackFire()).toBeTruthy(
      `For ButtonExperimental E2E test, the primary button failed to fire an onClick callback with a mouse click. Please contact
       the ButtonV1 engineer for more details.`,
    );
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);

    await ButtonExperimentalPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Enter"', async () => {
    await ButtonExperimentalPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.ENTER);
    await expect(await ButtonExperimentalPageObject.didOnClickCallbackFire()).toBeTruthy(
      `For ButtonExperimental E2E test, the primary button failed to fire an onClick callback with a enter keypress. Please contact
       the ButtonV1 engineer for more details.`,
    );
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);

    await ButtonExperimentalPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "SPACE"', async () => {
    await ButtonExperimentalPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.SPACE);
    await expect(await ButtonExperimentalPageObject.didOnClickCallbackFire()).toBeTruthy(
      `For ButtonExperimental E2E test, the primary button failed to fire an onClick callback with a space keypress. Please contact
       the ButtonV1 engineer for more details.`,
    );
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});
