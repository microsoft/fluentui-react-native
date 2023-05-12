import DrawerPageObject from '../pages/DrawerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Drawer Testing Initialization', () => {
  it('Wait for app load', async () => {
    await DrawerPageObject.waitForInitialPageToDisplay();
    expect(await DrawerPageObject.isInitialPageDisplayed()).toBeTruthy(DrawerPageObject.ERRORMESSAGE_APPLOAD);
  });
});
