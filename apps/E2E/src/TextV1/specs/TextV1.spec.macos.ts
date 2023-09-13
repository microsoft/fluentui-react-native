import TextV1PageObject from '../pages/TextV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TextV1PageObject.waitForInitialPageToDisplay()).toBeTruthy(TextV1PageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TextV1 test page', async () => {
    await TextV1PageObject.navigateToPageAndLoadTests();
    expect(await TextV1PageObject.isPageLoaded()).toBeTruthy(TextV1PageObject.ERRORMESSAGE_PAGELOAD);
  });
});
