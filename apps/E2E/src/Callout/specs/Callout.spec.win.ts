import NavigateAppPage from '../../common/NavigateAppPage';
import CalloutPageObject from '../pages/CalloutPageObject.win';
import { CALLOUT_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/Callout/consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CALLOUT_A11Y_ROLE } from '../../common/consts';
import { ComponentSelector } from '../../common/BasePage';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Callout test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCalloutPage();
    await CalloutPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CalloutPageObject.isPageLoaded()).toBeTruthy(CalloutPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Callout Accessibility Testing', () => {
  beforeAll(async () => {
    await CalloutPageObject.scrollToTestElement();
    await CalloutPageObject.openCallout();
    await CalloutPageObject.waitForCalloutComponentInView(PAGE_TIMEOUT);
  });

  it('Validate accessibilityRole is correct', async () => {
    await expect(await CalloutPageObject.getAccessibilityRole()).toEqual(CALLOUT_A11Y_ROLE);
    await expect(await CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Set accessibilityLabel', async () => {
    await expect(await CalloutPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(CALLOUT_ACCESSIBILITY_LABEL);
    await expect(await CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  afterAll(async () => {
    await CalloutPageObject.closeCallout();
  });
});

describe('Callout Functional Testing', () => {
  beforeEach(async () => {
    await CalloutPageObject.scrollToTestElement();
    await CalloutPageObject.openCallout();
    await CalloutPageObject.waitForCalloutComponentInView(PAGE_TIMEOUT);
  });

  it('Open the callout and validate it loaded correctly (visible)', async () => {
    await expect(await CalloutPageObject.didCalloutLoad()).toBeTruthy();
  });

  afterEach(async () => {
    await CalloutPageObject.closeCallout();
  });
});
