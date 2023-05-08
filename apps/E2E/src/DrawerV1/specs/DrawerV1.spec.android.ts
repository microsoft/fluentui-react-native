import { AndroidAttribute, ANDROID_EDITTEXT, ANDROID_BUTTON } from '../../common/consts';
import {
  DrawerV1_ERROR_STRING,
  DrawerV1_ONCLICK_STRING,
  DrawerV1_START_STRING,
  DrawerV1_TEST_COMPONENT,
  DrawerV1_TYPE_STRING,
} from '../consts';
import DrawerV1PageObject from '../pages/DrawerV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('DrawerV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await DrawerV1PageObject.waitForInitialPageToDisplay();
    expect(await DrawerV1PageObject.isInitialPageDisplayed()).toBeTruthy(DrawerV1PageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to DrawerV1 test page', async () => {
    await DrawerV1PageObject.navigateToPageAndLoadTests(true);
    expect(await DrawerV1PageObject.isPageLoaded()).toBeTruthy(DrawerV1PageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('DrawerV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await DrawerV1PageObject.mobileScrollToTestElement();
  });

  it('DrawerV1 - Verify accessibilityLabel', async () => {
    await expect(
      await DrawerV1PageObject.compareAttribute(
        DrawerV1PageObject._primaryComponent,
        AndroidAttribute.AccessibilityLabel,
        DrawerV1_TEST_COMPONENT,
      ),
    ).toBeTruthy();

    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Edit text Class on Android', async () => {
    await expect(
      await DrawerV1PageObject.compareAttribute(DrawerV1PageObject._primaryComponent, AndroidAttribute.Class, ANDROID_EDITTEXT),
    ).toBeTruthy();

    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Accessory button Class on Android', async () => {
    await expect(
      await DrawerV1PageObject.compareAttribute(DrawerV1PageObject._accessoryButton, AndroidAttribute.Class, ANDROID_BUTTON),
    ).toBeTruthy();

    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('DrawerV1 Functional Testing', () => {
  /* Scrolls and waits for the DrawerV1 to be visible on the Test Page */
  beforeEach(async () => {
    await DrawerV1PageObject.mobileScrollToTestElement();
  });

  it('Validate OnChange() callback was fired', async () => {
    await DrawerV1PageObject.click(DrawerV1PageObject._primaryComponent);
    await DrawerV1PageObject.typeText(DrawerV1_TYPE_STRING);
    await expect(await DrawerV1PageObject.verifyTextContent(DrawerV1_START_STRING + DrawerV1_TYPE_STRING)).toBeTruthy();
    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate error state was achieved', async () => {
    await DrawerV1PageObject.click(DrawerV1PageObject._primaryComponent);
    await DrawerV1PageObject.typeText(DrawerV1_TYPE_STRING);
    await expect(await DrawerV1PageObject.verifyTextContent(DrawerV1_ERROR_STRING)).toBeTruthy();
    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessory icon OnPress() callback was fired -> Click', async () => {
    await DrawerV1PageObject.click(DrawerV1PageObject._accessoryButton);
    await expect(await DrawerV1PageObject.verifyTextContent(DrawerV1_ONCLICK_STRING)).toBeTruthy();
    await expect(await DrawerV1PageObject.didAssertPopup()).toBeFalsy(DrawerV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
