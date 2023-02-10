import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TEXT_A11Y_ROLE, Attribute } from '../../common/consts';
import NavigateAppPage from '../../common/NavigateAppPage';
import { TEXTV1_ACCESSIBILITY_LABEL, TEXTV1_CONTENT } from '../consts';
import TextV1PageObject from '../pages/TextV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TextV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextV1Page();
    await TextV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(await TextV1PageObject.isPageLoaded()).toBeTruthy(TextV1PageObject.ERRORMESSAGE_PAGELOAD);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('TextV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await TextV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Text".', async () => {
    expect(
      await TextV1PageObject.compareAttribute(TextV1PageObject._primaryComponent, Attribute.AccessibilityRole, TEXT_A11Y_ROLE),
    ).toBeTruthy();

    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await TextV1PageObject.compareAttribute(TextV1PageObject._primaryComponent, Attribute.AccessibilityLabel, TEXTV1_ACCESSIBILITY_LABEL),
    ).toBeTruthy();

    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to text content.', async () => {
    expect(
      await TextV1PageObject.compareAttribute(TextV1PageObject._secondaryComponent, Attribute.AccessibilityLabel, TEXTV1_CONTENT),
    ).toBeTruthy();

    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
