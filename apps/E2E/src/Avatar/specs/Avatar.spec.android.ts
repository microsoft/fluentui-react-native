import AvatarPageObject from '../pages/AvatarPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await AvatarPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Avatar test page', async () => {
    expect(await AvatarPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await AvatarPageObject.didAssertPopup())
      .withContext(AvatarPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
