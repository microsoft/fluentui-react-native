import NavigateAppPage from '../../common/NavigateAppPage';
import TextV1PageObject from '../pages/TextV1PageObject.win';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { ComponentSelector } from '../../common/BasePage';
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

  it('Text - Validate accessibilityRole is correct', async () => {
    await expect(await TextV1PageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Set accessibilityLabel', async () => {
    await expect(await TextV1PageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(TEXTV1_ACCESSIBILITY_LABEL);
    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Do not set accessibilityLabel -> Default to content', async () => {
    await expect(await TextV1PageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(TEXTV1_CONTENT);
    await expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
