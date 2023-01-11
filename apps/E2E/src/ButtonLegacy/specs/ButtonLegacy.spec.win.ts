import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonLegacyPageObject, { ButtonSelector } from '../pages/ButtonLegacyPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL_DEPRECATED, BUTTON_TEST_COMPONENT_LABEL_DEPRECATED } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);

    await NavigateAppPage.enableE2ETesterMode();
  });

  it('Click and navigate to Button Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonLegacyPageObject.isPageLoaded()).toBeTruthy(ButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);

    await ButtonLegacyPageObject.waitForE2ESectionToDisplay();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonLegacyPageObject.scrollToTestElement();
  });

  it('Button - Validate accessibilityRole is correct', async () => {
    await expect(await ButtonLegacyPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Button - Set accessibilityLabel', async () => {
    await expect(await ButtonLegacyPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
    );
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Button - Do not set accessibilityLabel -> Default to Button label', async () => {
    await expect(await ButtonLegacyPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
    );
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Legacy Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonLegacyPageObject.scrollToTestElement();
  });

  it('Validate OnClick() callback was fired -> Click', async () => {
    await ButtonLegacyPageObject.clickComponent();
    await expect(await ButtonLegacyPageObject.didOnClickCallbackFire()).toBeTruthy();
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);

    await ButtonLegacyPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Enter"', async () => {
    await ButtonLegacyPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.ENTER);
    await expect(await ButtonLegacyPageObject.didOnClickCallbackFire()).toBeTruthy();
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);

    await ButtonLegacyPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "SPACE"', async () => {
    await ButtonLegacyPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.SPACE);
    await expect(await ButtonLegacyPageObject.didOnClickCallbackFire()).toBeTruthy();
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
