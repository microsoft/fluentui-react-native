import ContextualMenuPageObject from '../pages/ContextualMenuPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ContextualMenuPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to ContextualMenu test page', async () => {
    await ContextualMenuPageObject.navigateToPageAndLoadTests();

    await expect(await ContextualMenuPageObject.didAssertPopup()).toBeFalsy(ContextualMenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
