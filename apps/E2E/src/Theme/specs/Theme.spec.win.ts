import ThemePageObject from '../pages/ThemePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Theme Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ThemePageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Theme test page', async () => {
    expect(await ThemePageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await ThemePageObject.didAssertPopup()).toBeFalsy(ThemePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
