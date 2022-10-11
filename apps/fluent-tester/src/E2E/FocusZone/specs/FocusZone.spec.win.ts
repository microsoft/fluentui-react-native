import NavigateAppPage from '../../common/NavigateAppPage';
import FocusZonePageObject, { GridButtonSelector, GridFocusZoneOption } from '../pages/FocusZonePageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';
import { Platform } from '../../common/BasePage';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusZone Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to FocusZone test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await FocusZonePageObject.scrollToComponentButton(Platform.Win32);
    await FocusZonePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToFocusZonePage();
    await FocusZonePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await FocusZonePageObject.isPageLoaded()).toBeTruthy(FocusZonePageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

/* FocusZone Functional Testing
 *
 * This test validates that keyboard navigation using both arrow keys and
 * tab key works, even when modifying how the FocusZone functions.
 *
 * */
describe('FocusZone Functional Testing', () => {
  beforeEach(async () => {
    await FocusZonePageObject.scrollToTestElement();
    await FocusZonePageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    await FocusZonePageObject.resetTest();
  });

  it('Navigate bidirectional focuszone by arrow keys - switches focus correctly', async () => {
    // move to 2 with right arrow
    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    // move to 3 with down arrow
    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Down_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Three)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it('Navigate horizontal focuszone by arrow keys - switches focus correctly', async () => {
    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.SetDirection, 'horizontal');
    // move to 2 with right arrow
    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    // down arrow shouldn't move focus
    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Down_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    // left arrow goes back
    await FocusZonePageObject.sendKeys(GridButtonSelector.Four, [Keys.Left_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Three)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it('Navigates vertical focuszone by arrow keys - switches focus correctly', async () => {
    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.SetDirection, 'vertical');

    // move to 2 with down arrow
    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Down_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    // right arrow shouldn't move focus
    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    // up arrow goes back
    await FocusZonePageObject.sendKeys(GridButtonSelector.Four, [Keys.Up_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Three)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it("Navigates none-direction focuszone by arrow keys - doesn't switch focus", async () => {
    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.SetDirection, 'none');

    // none of these key commands should move
    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Down_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Up_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Left_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it('Navigates bi-directional focuszone with 2d navigation - switches focus correctly', async () => {
    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.Set2DNavigation, true);

    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Down_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Four)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Four, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Five)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it('Navigates focuszone with circular navigation on - switches focus correctly', async () => {
    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Left_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.One)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Nine, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Nine)).toBeTruthy();

    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.SetCircularNavigation, true);

    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Left_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Nine)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Nine, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.One)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it("Navigates disabled focuszone by arrow keys - doesn't switch focus", async () => {
    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.Disable, true);

    // none of these key commands should move
    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Down_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Up_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Left_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Two, [Keys.Right_Arrow]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Two)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });

  it('Tabs in and out of the FocusZone - switches focus correctly', async () => {
    await FocusZonePageObject.sendKeys(GridButtonSelector.Before, [Keys.Tab]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.One)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.One, [Keys.Tab]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.After)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.After, [Keys.Shift, Keys.Tab]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Nine)).toBeTruthy();
  });

  it('Tabs in and out of the FocusZone with a defaultTabbableElement set - switches focus correctly', async () => {
    // This sets the defaultTabbableElement prop of the FocusZone to be grid button #4. Whenever a user tabs into the zone, button 4 should always be the first to be selected.
    await FocusZonePageObject.configureGridFocusZone(GridFocusZoneOption.UseDefaultTabbableElement, true);

    await FocusZonePageObject.sendKeys(GridButtonSelector.Before, [Keys.Tab]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Four)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.Four, [Keys.Tab]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.After)).toBeTruthy();

    await FocusZonePageObject.sendKeys(GridButtonSelector.After, [Keys.Shift, Keys.Tab]);
    await expect(await FocusZonePageObject.gridButtonIsFocused(GridButtonSelector.Four)).toBeTruthy();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT);
  });
});
