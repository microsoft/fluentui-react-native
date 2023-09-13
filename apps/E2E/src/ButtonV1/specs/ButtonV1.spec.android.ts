import { BUTTON_TEST_COMPONENT } from '../../ButtonLegacy/consts';
import { AndroidAttribute, ANDROID_BUTTON } from '../../common/consts';
import ButtonV1PageObject from '../pages/ButtonV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', () => {
  it('Wait for app load', async () => {
     expect(await ButtonV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Button test page', async () => {
    expect(await ButtonV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await ButtonV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
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
