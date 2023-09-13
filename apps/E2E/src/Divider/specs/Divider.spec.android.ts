import DividerPageObject from '../pages/DividerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Divider Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await DividerPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Divider test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await DividerPageObject.navigateToPageAndLoadTests()).toBeTrue();

    expect(await DividerPageObject.didAssertPopup()).toBeFalsy(DividerPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
