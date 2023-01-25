import IconV1PageObject from '../pages/IconV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('IconV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await IconV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to IconV1 test page', async () => {
    await IconV1PageObject.navigateToPageAndLoadTests();

    await expect(await IconV1PageObject.didAssertPopup()).toBeFalsy(IconV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
