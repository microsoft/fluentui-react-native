import { LINK_A11Y_ROLE, Attribute } from '../../common/consts';
import { LINK_ACCESSIBILITY_LABEL } from '../consts';
import LinkLegacyPageObject from '../pages/LinkLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Testing Initialization', () => {
  it('Wait for app load', async () => {
    await LinkLegacyPageObject.waitForInitialPageToDisplay();
    expect(await LinkLegacyPageObject.isInitialPageDisplayed()).toBeTruthy(LinkLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Link Legacy test page', async () => {
    await LinkLegacyPageObject.navigateToPageAndLoadTests(true);
    expect(await LinkLegacyPageObject.isPageLoaded()).toBeTruthy(LinkLegacyPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await LinkLegacyPageObject.didAssertPopup()).toBeFalsy(LinkLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Link Accessibility Testing', () => {
  beforeAll(async () => {
    await LinkLegacyPageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.HyperLink".', async () => {
    await expect(
      await LinkLegacyPageObject.compareAttribute(LinkLegacyPageObject._primaryComponent, Attribute.AccessibilityRole, LINK_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await LinkLegacyPageObject.didAssertPopup()).toBeFalsy(LinkLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" propagates to "Name" element attribute.', async () => {
    await expect(
      await LinkLegacyPageObject.compareAttribute(
        LinkLegacyPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        LINK_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await LinkLegacyPageObject.didAssertPopup()).toBeFalsy(LinkLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});
