import CalloutPageObject from '../pages/CalloutPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', function () {
  it('Wait for app load', async () => {
    await CalloutPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Callout test page', async () => {
    await CalloutPageObject.navigateToPageAndLoadTests();

    await expect(await CalloutPageObject.didAssertPopup()).toBeFalsy(CalloutPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
