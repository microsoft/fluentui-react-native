import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonPageObject, { ButtonSelector } from '../pages/ButtonPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import {
  BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
  BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
} from '../../../../fluent-tester/src/TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonPageObject.isPageLoaded()).toBeTruthy(ButtonPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Accessibility Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonPageObject.scrollToTestElement();
    await ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Button - Validate accessibilityRole is correct', async () => {
    await expect(await ButtonPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Button - Set accessibilityLabel', async () => {
    await expect(await ButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(BUTTON_ACCESSIBILITY_LABEL_DEPRECATED);
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Button - Do not set accessibilityLabel -> Default to Button label', async () => {
    await expect(await ButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(BUTTON_TEST_COMPONENT_LABEL_DEPRECATED);
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonPageObject.scrollToTestElement();
    await ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Validate OnClick() callback was fired -> Click', async () => {
    await ButtonPageObject.clickComponent();
    await expect(await ButtonPageObject.didOnClickCallbackFire()).toBeTruthy();
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);

    await ButtonPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Enter"', async () => {
    await ButtonPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.ENTER);
    await expect(await ButtonPageObject.didOnClickCallbackFire()).toBeTruthy();
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);

    await ButtonPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "SPACE"', async () => {
    await ButtonPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.SPACE);
    await expect(await ButtonPageObject.didOnClickCallbackFire()).toBeTruthy();
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});
