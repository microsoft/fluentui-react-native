import ThemePageObject from '../pages/ThemePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Theme Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ThemePageObject.waitForInitialPageToDisplay()).toBeTruthy(ThemePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Theme test page', async () => {
    await ThemePageObject.navigateToPageAndLoadTests();
    expect(await ThemePageObject.isPageLoaded()).toBeTruthy(ThemePageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await ThemePageObject.didAssertPopup()).toBeFalsy(ThemePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
