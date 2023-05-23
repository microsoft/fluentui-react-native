import BasicBadgePageObject from '../pages/BasicBadgePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Badge Testing Initialization', () => {
  it('Wait for app load', async () => {
    await BasicBadgePageObject.waitForInitialPageToDisplay();
    expect(await BasicBadgePageObject.isInitialPageDisplayed()).toBeTruthy(BasicBadgePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Badge test page', async () => {
    await BasicBadgePageObject.navigateToPageAndLoadTests();
    expect(await BasicBadgePageObject.isPageLoaded()).toBeTruthy(BasicBadgePageObject.ERRORMESSAGE_PAGELOAD);
  });
});
