import NavigateAppPage from '../../common/NavigateAppPage';
import TextLegacyPageObject from '../pages/TextLegacyPageObject';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Attribute } from '../../common/consts';
import { DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL, DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextLegacyPage();
    await TextLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextLegacyPageObject.isPageLoaded()).toBeTruthy(TextLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Text Legacy Accessibility Testing', () => {
  beforeEach(async () => {
    await TextLegacyPageObject.scrollToTestElement(await TextLegacyPageObject._deprecatedFirstComponent);
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Text".', async () => {
    await expect(
      await TextLegacyPageObject.compareAttribute(
        TextLegacyPageObject._deprecatedFirstComponent,
        Attribute.AccessibilityRole,
        TEXT_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await TextLegacyPageObject.compareAttribute(
        TextLegacyPageObject._deprecatedFirstComponent,
        Attribute.AccessibilityLabel,
        DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to text content.', async () => {
    await expect(
      await TextLegacyPageObject.compareAttribute(
        TextLegacyPageObject._deprecatedSecondComponent,
        Attribute.AccessibilityLabel,
        DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
      ),
    ).toBeTruthy();

    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
