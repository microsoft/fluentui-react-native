import BasicBadgePageObject from '../pages/BasicBadgePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Badge Testing Initialization', function () {
  it('Wait for app load', async () => {
    await BasicBadgePageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Badge test page', async () => {
    await BasicBadgePageObject.navigateToPageAndLoadTests();

    await expect(await BasicBadgePageObject.didAssertPopup()).toBeFalsy(BasicBadgePageObject.ERRORMESSAGE_ASSERT);
  });
});
