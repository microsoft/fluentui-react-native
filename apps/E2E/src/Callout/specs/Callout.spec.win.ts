import NavigateAppPage from '../../common/NavigateAppPage';
import CalloutPageObject from '../pages/CalloutPageObject.win';
import { CALLOUT_ACCESSIBILITY_LABEL } from '../../../../fluent-tester/src/TestComponents/Callout/consts';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, CALLOUT_A11Y_ROLE, Attribute } from '../../common/consts';

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
    await CalloutPageObject.scrollToTestElement(await CalloutPageObject._buttonToOpenCallout);
    await CalloutPageObject.openCalloutAndWaitForLoad();
  });

  it('Validate "accessibilityRole" is correct', async () => {
    await expect(
      await CalloutPageObject.compareAttribute(CalloutPageObject._primaryComponent, Attribute.AccessibilityRole, CALLOUT_A11Y_ROLE),
    ).toBeTrue();

    await expect(await CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Validate "accessibilityLabel" is correct AFTER setting "accessibilityLabel"', async () => {
    await expect(
      await CalloutPageObject.compareAttribute(
        CalloutPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        CALLOUT_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  afterAll(async () => {
    await CalloutPageObject.closeCallout();
  });
});

describe('Callout Functional Testing', () => {
  beforeEach(async () => {
    await CalloutPageObject.scrollToTestElement(await CalloutPageObject._buttonToOpenCallout);
    await CalloutPageObject.openCalloutAndWaitForLoad();
  });

  it('Validate that it is visible and loaded AFTER clicking a button to open the Callout', async () => {
    await expect(await CalloutPageObject.isCalloutOpen()).toBeTruthy('The callout failed to visibly display.');
  });

  afterEach(async () => {
    await CalloutPageObject.closeCallout();
  });
});
