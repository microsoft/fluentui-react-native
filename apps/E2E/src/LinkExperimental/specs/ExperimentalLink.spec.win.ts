import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalLinkPageObject from '../pages/LinkPageObject';
import { ComponentSelector } from '../../common/BasePage';
import { EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/LinkExperimental/consts';
import { LINK_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Link test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToLinkExperimentalPage();
    await ExperimentalLinkPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalLinkPageObject.isPageLoaded()).toBeTruthy(ExperimentalLinkPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ExperimentalLinkPageObject.didAssertPopup()).toBeFalsy(ExperimentalLinkPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Link Accessibility Testing', () => {
  it('Link - Validate accessibilityRole is correct', async () => {
    await ExperimentalLinkPageObject.scrollToTestElement();
    await ExperimentalLinkPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalLinkPageObject.getAccessibilityRole()).toEqual(LINK_A11Y_ROLE);
    await expect(await ExperimentalLinkPageObject.didAssertPopup()).toBeFalsy(ExperimentalLinkPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Link - Set accessibilityLabel', async () => {
    await ExperimentalLinkPageObject.scrollToTestElement();
    await ExperimentalLinkPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalLinkPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL,
    );
    await expect(await ExperimentalLinkPageObject.didAssertPopup()).toBeFalsy(ExperimentalLinkPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});
