import PersonaCoinPageObject from '../pages/PersonaCoinPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('PersonaCoin Testing Initialization', function () {
  it('Wait for app load', async () => {
    await PersonaCoinPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to PersonaCoin test page', async () => {
    await PersonaCoinPageObject.navigateToPageAndLoadTests();
  });
});
