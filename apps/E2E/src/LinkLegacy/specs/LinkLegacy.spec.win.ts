import NavigateAppPage from '../../common/NavigateAppPage';
import LinkLegacyPageObject from '../pages/LinkLegacyPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { LINK_ACCESSIBILITY_LABEL } from '../consts';
import { LINK_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Link Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToLinkLegacyPage();
    await LinkLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await LinkLegacyPageObject.isPageLoaded()).toBeTruthy(LinkLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await LinkLegacyPageObject.didAssertPopup()).toBeFalsy(LinkLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Link Legacy Accessibility Testing', () => {
  it('Link - Validate accessibilityRole is correct', async () => {
    await LinkLegacyPageObject.scrollToTestElement();

    await expect(await LinkLegacyPageObject.getAccessibilityRole()).toEqual(LINK_A11Y_ROLE);
    await expect(await LinkLegacyPageObject.didAssertPopup()).toBeFalsy(LinkLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped u
  });

  it('Link - Set accessibilityLabel', async () => {
    await LinkLegacyPageObject.scrollToTestElement();

    await expect(await LinkLegacyPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(LINK_ACCESSIBILITY_LABEL);
    await expect(await LinkLegacyPageObject.didAssertPopup()).toBeFalsy(LinkLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped u
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});
