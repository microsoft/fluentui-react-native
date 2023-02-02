import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TEXT_A11Y_ROLE } from '../../common/consts';
import NavigateAppPage from '../../common/NavigateAppPage';
import { TEXTV1_ACCESSIBILITY_LABEL, TEXTV1_CONTENT } from '../consts';
import TextV1PageObject from '../pages/TextV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', function () {
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

  it('Text - Validate accessibilityRole is correct', async () => {
    expect(await TextV1PageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Set accessibilityLabel', async () => {
    expect(await TextV1PageObject.getAccessibilityLabel('Primary')).toEqual(TEXTV1_ACCESSIBILITY_LABEL);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Do not set accessibilityLabel -> Default to content', async () => {
    expect(await TextV1PageObject.getAccessibilityLabel('Secondary')).toEqual(TEXTV1_CONTENT);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
