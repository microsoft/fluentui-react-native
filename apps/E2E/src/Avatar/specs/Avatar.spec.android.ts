import AvatarPageObject from '../pages/AvatarPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', () => {
  it('Wait for app load', async () => {
    await AvatarPageObject.waitForInitialPageToDisplay();

    expect(await AvatarPageObject.isInitialPageDisplayed()).toBeTruthy(AvatarPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Avatar test page', async () => {
    await AvatarPageObject.navigateToPageAndLoadTests();
    expect(await AvatarPageObject.isPageLoaded()).toBeTruthy(AvatarPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });
});
