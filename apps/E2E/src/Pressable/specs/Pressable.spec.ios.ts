import PressablePageObject from '../pages/PressablePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Pressable Testing Initialization', () => {
  it('Wait for app load', async () => {
    await PressablePageObject.waitForInitialPageToDisplay();
    expect(await PressablePageObject.isInitialPageDisplayed()).toBeTruthy(PressablePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Pressable test page', async () => {
    await PressablePageObject.navigateToPageAndLoadTests();
    expect(await PressablePageObject.isPageLoaded()).toBeTruthy(PressablePageObject.ERRORMESSAGE_PAGELOAD);
  });
});
