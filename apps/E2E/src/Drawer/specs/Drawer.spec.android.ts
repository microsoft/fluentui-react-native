import DrawerPageObject from '../pages/DrawerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Drawer Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await DrawerPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });
});
