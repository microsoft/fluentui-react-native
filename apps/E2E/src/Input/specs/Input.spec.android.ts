import { AndroidAttribute, ANDROID_EDITTEXT, ANDROID_BUTTON } from '../../common/consts';
import { INPUT_ERROR_STRING, INPUT_ONCLICK_STRING, INPUT_START_STRING, INPUT_TEST_COMPONENT, INPUT_TYPE_STRING } from '../consts';
import InputPageObject from '../pages/InputPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Input Testing Initialization', () => {
  it('Wait for app load', async () => {
    await InputPageObject.waitForInitialPageToDisplay();
    expect(await InputPageObject.isInitialPageDisplayed()).toBeTruthy(InputPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Input test page', async () => {
    await InputPageObject.navigateToPageAndLoadTests(true);
    expect(await InputPageObject.isPageLoaded()).toBeTruthy(InputPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Input Accessibility Testing', () => {
  beforeEach(async () => {
    await InputPageObject.mobileScrollToTestElement();
  });

  it('Input - Verify accessibilityLabel', async () => {
    await expect(
      await InputPageObject.compareAttribute(InputPageObject._primaryComponent, AndroidAttribute.AccessibilityLabel, INPUT_TEST_COMPONENT),
    ).toBeTruthy();

    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Edit text Class on Android', async () => {
    await expect(
      await InputPageObject.compareAttribute(InputPageObject._primaryComponent, AndroidAttribute.Class, ANDROID_EDITTEXT),
    ).toBeTruthy();

    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Accessory button Class on Android', async () => {
    await expect(
      await InputPageObject.compareAttribute(InputPageObject._accessoryButton, AndroidAttribute.Class, ANDROID_BUTTON),
    ).toBeTruthy();

    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Input Functional Testing', () => {
  /* Scrolls and waits for the Input to be visible on the Test Page */
  beforeEach(async () => {
    await InputPageObject.mobileScrollToTestElement();
  });

  it('Validate OnChange() callback was fired', async () => {
    await InputPageObject.click(InputPageObject._primaryComponent);
    await InputPageObject.typeText(INPUT_TYPE_STRING);
    await expect(await InputPageObject.verifyTextContent(INPUT_START_STRING + INPUT_TYPE_STRING)).toBeTruthy();
    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate error state was achieved', async () => {
    await InputPageObject.click(InputPageObject._primaryComponent);
    await InputPageObject.typeText(INPUT_TYPE_STRING);
    await expect(await InputPageObject.verifyTextContent(INPUT_ERROR_STRING)).toBeTruthy();
    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessory icon OnPress() callback was fired -> Click', async () => {
    await InputPageObject.click(InputPageObject._accessoryButton);
    await expect(await InputPageObject.verifyTextContent(INPUT_ONCLICK_STRING)).toBeTruthy();
    await expect(await InputPageObject.didAssertPopup()).toBeFalsy(InputPageObject.ERRORMESSAGE_ASSERT);
  });
});
