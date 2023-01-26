import SeparatorPageObject from '../pages/SeparatorPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Separator Testing Initialization', function () {
  it('Wait for app load', async () => {
    await SeparatorPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Separator test page', async () => {
    await SeparatorPageObject.navigateToPageAndLoadTests();

    await expect(await SeparatorPageObject.didAssertPopup()).toBeFalsy(SeparatorPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
