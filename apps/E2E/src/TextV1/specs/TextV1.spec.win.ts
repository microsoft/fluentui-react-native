import NavigateAppPage from '../../common/NavigateAppPage';
import TextV1PageObject from '../pages/TextV1PageObject.win';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Attribute } from '../../common/consts';
import { TEXTV1_ACCESSIBILITY_LABEL, TEXTV1_CONTENT } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TextV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextV1Page();
    await TextV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextV1PageObject.isPageLoaded()).toBeTruthy(TextV1PageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('TextV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await TextV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Text".', async () => {
    await expect(
      await TextV1PageObject.compareAttribute(TextV1PageObject._primaryComponent, Attribute.AccessibilityRole, TEXT_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await TextV1PageObject.compareAttribute(TextV1PageObject._primaryComponent, Attribute.AccessibilityLabel, TEXTV1_ACCESSIBILITY_LABEL),
    ).toBeTruthy();

    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to text content.', async () => {
    await expect(
      await TextV1PageObject.compareAttribute(TextV1PageObject._secondaryComponent, Attribute.AccessibilityLabel, TEXTV1_CONTENT),
    ).toBeTruthy();

    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
