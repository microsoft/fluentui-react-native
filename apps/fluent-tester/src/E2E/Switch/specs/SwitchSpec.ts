import NavigateAppPage from '../../common/NavigateAppPage.win';
import SwitchPageObject, { SwitchComponentSelector } from '../pages/SwitchPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Switch Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Switch test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    SwitchPageObject.scrollToComponentButton();
    SwitchPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToSwitchPage();
    SwitchPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(SwitchPageObject.isPageLoaded()).toBeTruthy(SwitchPageObject.ERRORMESSAGE_PAGELOAD);
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Switch Functional Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(() => {
    SwitchPageObject.scrollToTestElement();
    SwitchPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Validate onChange() callback was fired -> Click', () => {
    SwitchPageObject.clickComponent();
    expect(SwitchPageObject.didToggleOn()).toBeTruthy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);

    SwitchPageObject.clickComponent();
    expect(SwitchPageObject.didToggleOff()).toBeTruthy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate onChange() callback was fired -> Type "Enter"', () => {
    SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Enter);
    expect(SwitchPageObject.didToggleOn()).toBeTruthy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);

    SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Enter);
    expect(SwitchPageObject.didToggleOff()).toBeTruthy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate onChange() callback was fired -> Type "Spacebar"', () => {
    SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Spacebar);
    expect(SwitchPageObject.didToggleOn()).toBeTruthy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);

    SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Spacebar);
    expect(SwitchPageObject.didToggleOff()).toBeTruthy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });
});
