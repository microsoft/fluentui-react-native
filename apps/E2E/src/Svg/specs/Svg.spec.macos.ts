import SvgPageObject from '../pages/SvgPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Svg Testing Initialization', function () {
  it('Wait for app load', async () => {
    await SvgPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Svg test page', async () => {
    await SvgPageObject.navigateToPageAndLoadTests();

    await expect(await SvgPageObject.didAssertPopup()).toBeFalsy(SvgPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
