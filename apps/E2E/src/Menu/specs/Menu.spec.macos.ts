import MenuPageObject from '../pages/MenuPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', function () {
  it('Wait for app load', async () => {
    await MenuPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Menu test page', async () => {
    /* Click on component button to navigate to test page */
    await MenuPageObject.navigateToPageAndLoadTests();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
