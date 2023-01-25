import AvatarPageObject from '../pages/AvatarPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', function () {
  it('Wait for app load', async () => {
    await AvatarPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Avatar test page', async () => {
    await AvatarPageObject.navigateToPageAndLoadTests();

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });
});
