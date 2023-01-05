import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonLegacyPageObject from '../pages/ButtonLegacyPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL_DEPRECATED, BUTTON_TEST_COMPONENT_LABEL_DEPRECATED } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonLegacyPageObject.isPageLoaded()).toBeTruthy(ButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonLegacyPageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to Button "ControlType" element attribute.', async () => {
    await expect(
      await ButtonLegacyPageObject.compareAttribute(
        ButtonLegacyPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        BUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await ButtonLegacyPageObject.compareAttribute(
        ButtonLegacyPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
      ),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the button label.', async () => {
    await expect(
      await ButtonLegacyPageObject.compareAttribute(
        ButtonLegacyPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
      ),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Legacy Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonLegacyPageObject.scrollToTestElement();
  });

  it('Click primary button. Validate onClick() callback was fired.', async () => {
    await ButtonLegacyPageObject.click(ButtonLegacyPageObject._primaryComponent);
    await expect(
      await ButtonLegacyPageObject.didOnClickCallbackFire('Clicking on the primary button failed to fire the onClick() callback.'),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);

    await ButtonLegacyPageObject.clickComponent(); // Reset Button State
  });

  it('Type "Enter" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonLegacyPageObject.sendKeys(ButtonLegacyPageObject._primaryComponent, [Keys.ENTER]);
    await expect(
      await ButtonLegacyPageObject.didOnClickCallbackFire(
        "Pressing the 'Enter' key on the primary button failed to fire the onClick() callback.",
      ),
    ).toBeTruthy();
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);

    await ButtonLegacyPageObject.clickComponent(); // Reset Button State
  });

  it('Type "Space" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonLegacyPageObject.sendKeys(ButtonLegacyPageObject._primaryComponent, [Keys.SPACE]);
    await expect(
      await ButtonLegacyPageObject.didOnClickCallbackFire(
        "Pressing the 'Space' key on the primary button failed to fire the onClick() callback.",
      ),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
