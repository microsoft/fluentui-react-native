import NavigateAppPage from '../../common/NavigateAppPage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, AndroidAttribute, ANDROID_BUTTON } from '../../common/consts';
import ButtonV1PageObject from '../pages/ButtonV1PageObject';
import { BUTTON_TEST_COMPONENT } from '../../ButtonLegacy/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Button test page', async () => {
    await ButtonV1PageObject.mobileScrollToComponentButton();
    await ButtonV1PageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonV1PageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('ButtonV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await ButtonV1PageObject.mobileScrollToTestElement();
  });

  it('ButtonV1 - Verify accessibilityLabel', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._primaryComponent,
        AndroidAttribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT,
      ),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Button Class on Android', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(ButtonV1PageObject._primaryComponent, AndroidAttribute.Class, ANDROID_BUTTON),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('ButtonV1 Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonV1PageObject.mobileScrollToTestElement();
  });

  it('Validate OnClick() callback was fired -> Click', async () => {
    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent);
    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(`The primary button failed to fire an onClick callback with a mouse click.`),
    ).toBeTruthy();
    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);

    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent); // Reset Button State
  });
});
