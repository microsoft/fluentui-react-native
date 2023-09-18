import PressablePageObject from '../pages/PressablePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Pressable Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await PressablePageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Pressable test page', async () => {
    expect(await PressablePageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await PressablePageObject.didAssertPopup()).toBeFalsy(PressablePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
