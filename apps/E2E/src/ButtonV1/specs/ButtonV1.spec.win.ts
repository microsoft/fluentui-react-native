import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonV1PageObject from '../pages/ButtonV1PageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../ButtonLegacy/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('ButtonV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to ButtonV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonV1PageObject.isPageLoaded()).toBeTruthy(ButtonV1PageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('ButtonV1 Accessibility Testing', async () => {
  beforeEach(async () => {
    await ButtonV1PageObject.expandE2ESections();
    await ButtonV1PageObject.scrollToTestElement();
  });

  it('ButtonV1 - Validate accessibilityRole is correct', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(ButtonV1PageObject._primaryComponent, Attribute.AccessibilityRole, BUTTON_A11Y_ROLE),
    ).toBeTrue();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('ButtonV1 - Set accessibilityLabel', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('ButtonV1 - Do not set accessibilityLabel -> Default to Button label', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('ButtonV1 Functional Testing', async () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonV1PageObject.scrollToTestElement();
  });

  it('Validate OnClick() callback was fired -> Click', async () => {
    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent);
    await expect(await ButtonV1PageObject.didOnClickCallbackFire()).toBeTruthy(
      `The primary button failed to fire an onClick callback with a mouse click.`,
    );
    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);

    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Enter"', async () => {
    await ButtonV1PageObject.sendKeys(ButtonV1PageObject._primaryComponent, [Keys.ENTER]);
    await expect(await ButtonV1PageObject.didOnClickCallbackFire()).toBeTruthy(
      `The primary button failed to fire an onClick callback with an enter keypress.`,
    );
    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);

    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "SPACE"', async () => {
    await ButtonV1PageObject.sendKeys(ButtonV1PageObject._primaryComponent, [Keys.SPACE]);
    await expect(await ButtonV1PageObject.didOnClickCallbackFire()).toBeTruthy(
      `The primary button failed to fire an onClick callback with a space keypress.`,
    );
    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
