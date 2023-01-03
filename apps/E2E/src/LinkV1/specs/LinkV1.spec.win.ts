import NavigateAppPage from '../../common/NavigateAppPage';
import LinkV1PageObject from '../pages/LinkV1PageObject';
import { LINKV1_ACCESSIBILITY_LABEL } from '../consts';
import { LINK_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Attribute } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('LinkV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to LinkV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToLinkV1Page();
    await LinkV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await LinkV1PageObject.isPageLoaded()).toBeTruthy(LinkV1PageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await LinkV1PageObject.didAssertPopup()).toBeFalsy(LinkV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('LinkV1 Accessibility Testing', () => {
  beforeAll(async () => {
    await LinkV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to Link "ControlType" element attribute.', async () => {
    await expect(
      await LinkV1PageObject.compareAttribute(LinkV1PageObject._primaryComponent, Attribute.AccessibilityRole, LINK_A11Y_ROLE),
    ).toBeTrue();

    await expect(await LinkV1PageObject.didAssertPopup()).toBeFalsy(LinkV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" propagates to "Name" element attribute.', async () => {
    await expect(
      await LinkV1PageObject.compareAttribute(LinkV1PageObject._primaryComponent, Attribute.AccessibilityLabel, LINKV1_ACCESSIBILITY_LABEL),
    ).toBeTrue();

    await expect(await LinkV1PageObject.didAssertPopup()).toBeFalsy(LinkV1PageObject.ERRORMESSAGE_ASSERT);
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});
