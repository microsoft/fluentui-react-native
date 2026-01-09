import { TEXT_A11Y_ROLE, Attribute } from '../../common/consts';
import { DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL, DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT } from '../consts';
import TextLegacyPageObject from '../pages/TextLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TextLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Text Legacy test page', async () => {
    expect(await TextLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await TextLegacyPageObject.enableE2ETesterMode()).toBeTrue();

    expect(await TextLegacyPageObject.didAssertPopup())
      .withContext(TextLegacyPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('Text Legacy Accessibility Testing', () => {
  beforeEach(async () => {
    await TextLegacyPageObject.scrollToTestElement(TextLegacyPageObject._deprecatedFirstComponent);
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Text".', async () => {
    expect(
      await TextLegacyPageObject.compareAttribute(
        TextLegacyPageObject._deprecatedFirstComponent,
        Attribute.AccessibilityRole,
        TEXT_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await TextLegacyPageObject.compareAttribute(
        TextLegacyPageObject._deprecatedFirstComponent,
        Attribute.AccessibilityLabel,
        DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to text content.', async () => {
    expect(
      await TextLegacyPageObject.compareAttribute(
        TextLegacyPageObject._deprecatedSecondComponent,
        Attribute.AccessibilityLabel,
        DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
      ),
    ).toBeTruthy();
  });
});
