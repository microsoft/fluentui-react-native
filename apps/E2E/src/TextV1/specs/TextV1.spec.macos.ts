import TextV1PageObject from '../pages/TextV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TextV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to TextV1 test page', async () => {
    expect(await TextV1PageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
