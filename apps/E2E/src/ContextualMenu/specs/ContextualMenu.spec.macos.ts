import ContextualMenuPageObject from '../pages/ContextualMenuPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ContextualMenuPageObject.waitForInitialPageToDisplay()).toBeTruthy(ContextualMenuPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to ContextualMenu test page', async () => {
    await ContextualMenuPageObject.navigateToPageAndLoadTests();
    expect(await ContextualMenuPageObject.isPageLoaded()).toBeTruthy(ContextualMenuPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
