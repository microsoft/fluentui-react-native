import NavigateAppPage from '../../common/NavigateAppPage';
import TextLegacyPageObject, { TextComponentSelector } from '../pages/TextLegacyPageObject';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
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

  it('Text Legacy - Validate accessibilityRole is correct', async () => {
    await expect(await TextLegacyPageObject.getTextAccessibilityRole(TextComponentSelector.Deprecated_First)).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text Legacy - Set accessibilityLabel', async () => {
    await expect(await TextLegacyPageObject.getTextAccessibilityLabel(TextComponentSelector.Deprecated_First)).toEqual(
      DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
    );
    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text Legacy - Do not set accessibilityLabel -> Default to content', async () => {
    await expect(await TextLegacyPageObject.getTextAccessibilityLabel(TextComponentSelector.Deprecated_Second)).toEqual(
      DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
    );
    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
