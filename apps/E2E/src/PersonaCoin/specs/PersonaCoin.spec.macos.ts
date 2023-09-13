import PersonaCoinPageObject from '../pages/PersonaCoinPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('PersonaCoin Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await PersonaCoinPageObject.waitForInitialPageToDisplay()).toBeTruthy(PersonaCoinPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to PersonaCoin test page', async () => {
    await PersonaCoinPageObject.navigateToPageAndLoadTests();
    expect(await PersonaCoinPageObject.isPageLoaded()).toBeTruthy(PersonaCoinPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
