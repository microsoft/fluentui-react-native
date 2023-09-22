import CalloutPageObject from '../pages/CalloutPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CalloutPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Callout test page', async () => {
    expect(await CalloutPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
