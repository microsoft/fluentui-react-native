import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonExperimentalPageObject from '../pages/ButtonExperimentalPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../Button/consts';

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

  it('Validate "accessibilityRole" value is correct, propagates to "ControlType" element attribute.', async () => {
    await expect(
      await ButtonExperimentalPageObject.compareAttribute(
        ButtonExperimentalPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        BUTTON_A11Y_ROLE,
      ),
    ).toBeTrue();

    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await ButtonExperimentalPageObject.compareAttribute(
        ButtonExperimentalPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "accessibilityLabel" value defaults to the button label.', async () => {
    await expect(
      await ButtonExperimentalPageObject.compareAttribute(
        ButtonExperimentalPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Experimental Button Functional Testing', async () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonExperimentalPageObject.scrollToTestElement();
  });

  it('Click primary button. Validate onClick() callback was fired.', async () => {
    await ButtonExperimentalPageObject.click(ButtonExperimentalPageObject._primaryComponent);
    await expect(
      await ButtonExperimentalPageObject.didOnClickCallbackFire(
        `The primary button failed to fire an onClick callback with a mouse click.`,
      ),
    ).toBeTruthy();
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);

    await ButtonExperimentalPageObject.click(ButtonExperimentalPageObject._primaryComponent); // Reset Button State
  });

  it('Type "Enter" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonExperimentalPageObject.sendKeys(ButtonExperimentalPageObject._primaryComponent, [Keys.ENTER]);
    await expect(
      await ButtonExperimentalPageObject.didOnClickCallbackFire(
        `The primary button failed to fire an onClick callback with an enter keypress.`,
      ),
    ).toBeTruthy();
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);

    await ButtonExperimentalPageObject.click(ButtonExperimentalPageObject._primaryComponent); // Reset Button State
  });

  it('Type "Space" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonExperimentalPageObject.sendKeys(ButtonExperimentalPageObject._primaryComponent, [Keys.SPACE]);
    await expect(
      await ButtonExperimentalPageObject.didOnClickCallbackFire(
        `The primary button failed to fire an onClick callback with a space keypress.`,
      ),
    ).toBeTruthy();
    await expect(await ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});
