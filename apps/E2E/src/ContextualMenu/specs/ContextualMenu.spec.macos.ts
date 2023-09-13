import ContextualMenuPageObject from '../pages/ContextualMenuPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ContextualMenuPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to ContextualMenu test page', async () => {
    expect(await ContextualMenuPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
