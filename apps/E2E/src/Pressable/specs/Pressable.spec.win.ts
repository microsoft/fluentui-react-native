import PressablePageObject from '../pages/PressablePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Pressable Testing Initialization', function () {
  it('Wait for app load', async () => {
    await PressablePageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Pressable test page', async () => {
    await PressablePageObject.navigateToPageAndLoadTests();

    await expect(await PressablePageObject.didAssertPopup()).toBeFalsy(PressablePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
