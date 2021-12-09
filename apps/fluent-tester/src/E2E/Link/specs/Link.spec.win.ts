import NavigateAppPage from '../../common/NavigateAppPage';
import LinkPageObject from '../pages/LinkPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { LINK_ACCESSIBILITY_LABEL } from '../../../FluentTester/TestComponents/Link/consts';
import { LINK_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Link test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    LinkPageObject.scrollToComponentButton();
    LinkPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToLinkPage();
    LinkPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(LinkPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('Link Accessibility Testing', () => {
  it('Link - Validate accessibilityRole is correct', () => {
    LinkPageObject.scrollToTestElement();
    LinkPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(LinkPageObject.getAccessibilityRole()).toEqual(LINK_A11Y_ROLE);
  });

  it('Link - Set accessibilityLabel', () => {
    LinkPageObject.scrollToTestElement();
    LinkPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(LinkPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(LINK_ACCESSIBILITY_LABEL);
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});
