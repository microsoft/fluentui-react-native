import IconLegacyPageObject from '../pages/IconLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Icon Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await IconLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Icon Legacy test page', async () => {
    expect(await IconLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await IconLegacyPageObject.didAssertPopup())
      .withContext(IconLegacyPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});
