import { Attribute, CALLOUT_A11Y_ROLE } from '../../common/consts';
import { CALLOUT_ACCESSIBILITY_LABEL } from '../consts';
import CalloutPageObject from '../pages/CalloutPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CalloutPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Callout test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await CalloutPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await CalloutPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await CalloutPageObject.didAssertPopup())
      .withContext(CalloutPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('Callout Accessibility Testing', () => {
  beforeAll(async () => {
    await CalloutPageObject.scrollToTestElement(CalloutPageObject._buttonToOpenCallout);
    await CalloutPageObject.openCalloutAndWaitForLoad();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Group".', async () => {
    await expect(
      await CalloutPageObject.compareAttribute(CalloutPageObject._primaryComponent, Attribute.AccessibilityRole, CALLOUT_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await CalloutPageObject.compareAttribute(
        CalloutPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        CALLOUT_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
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

  it('Open Callout by clicking a button. Validate that the Callout is displayed.', async () => {
    await expect(await CalloutPageObject.isCalloutOpen())
      .withContext('The callout failed to visibly display.')
      .toBeTruthy();
  });

  afterEach(async () => {
    await CalloutPageObject.closeCallout();
  });
});
