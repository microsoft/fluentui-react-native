import ThemePageObject from '../pages/ThemePageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Theme Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ThemePageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Theme test page', async () => {
    await ThemePageObject.navigateToPageAndLoadTests();
  });
});
