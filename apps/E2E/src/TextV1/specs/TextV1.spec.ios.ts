import TextV1PageObject from '../pages/TextV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TextV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to TextV1 test page', async () => {
    await TextV1PageObject.navigateToPageAndLoadTests();
  });
});
