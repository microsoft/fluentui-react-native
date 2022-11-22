import NavigateAppPage from '../../common/NavigateAppPage';
import LinkPageObject from '../pages/LinkPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { LINK_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/Link/consts';
import { LINK_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Link test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToLinkPage();
    await LinkPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await LinkPageObject.isPageLoaded()).toBeTruthy(LinkPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await LinkPageObject.didAssertPopup()).toBeFalsy(LinkPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Link Accessibility Testing', () => {
  it('Link - Validate accessibilityRole is correct', async () => {
    await LinkPageObject.scrollToTestElement();
    await LinkPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await LinkPageObject.getAccessibilityRole()).toEqual(LINK_A11Y_ROLE);
    await expect(await LinkPageObject.didAssertPopup()).toBeFalsy(LinkPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped u
  });

  it('Link - Set accessibilityLabel', async () => {
    await LinkPageObject.scrollToTestElement();
    await LinkPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await LinkPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(LINK_ACCESSIBILITY_LABEL);
    await expect(await LinkPageObject.didAssertPopup()).toBeFalsy(LinkPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped u
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});
