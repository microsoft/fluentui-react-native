import NavigateAppPage from '../../common/NavigateAppPage';
import SwitchPageObject from '../pages/SwitchPageObject';
import { SwitchComponentSelector } from '../pages/SwitchPageObject';
import { ComponentSelector, Platform } from '../../common/BasePage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import { SWITCH_TEST_COMPONENT_LABEL, SWITCH_ACCESSIBILITY_LABEL } from '../../../TestComponents/Switch/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Switch Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Switch test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await SwitchPageObject.scrollToComponentButton(Platform.Win32);
    await SwitchPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToSwitchPage();
    await SwitchPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await SwitchPageObject.isPageLoaded()).toBeTruthy(SwitchPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Switch Accessibility Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(async () => {
    await SwitchPageObject.scrollToTestElement();
    await SwitchPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Switch - Validate accessibilityRole is correct', async () => {
    await expect(await SwitchPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Switch - Set accessibilityLabel', async () => {
    await expect(await SwitchPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(SWITCH_ACCESSIBILITY_LABEL);
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Switch - Do not set accessibilityLabel -> Default to Switch label', async () => {
    await expect(await SwitchPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(SWITCH_TEST_COMPONENT_LABEL);
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Switch Functional Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(async () => {
    await SwitchPageObject.scrollToTestElement();
    await SwitchPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it("Click on a Switch -> Validate it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Switch is initially toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy();

    /* Click on the Switch to toggle on */
    await SwitchPageObject.clickComponent();
    await SwitchPageObject.waitForSwitchChecked(PAGE_TIMEOUT);

    await expect(await SwitchPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Switch is toggled ON */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeTruthy();

    await SwitchPageObject.clickComponent();

    /* Validate the Switch is toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy();
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Click the 'Enter' on a Switch and verify it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Switch is initially toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy();

    /* Presses the "Enter" to select the Switch */
    await SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Enter);
    await SwitchPageObject.waitForSwitchChecked(PAGE_TIMEOUT);

    await expect(await SwitchPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Switch is toggled ON */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeTruthy();
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);

    await SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Enter);

    /* Validate the Switch is toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy();
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Click the 'Spacebar' on a Switch and verify it toggles correctly AND calls the user's onChange", async () => {
    /* Validate the Switch is initially toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy();

    /* Presses the "space bar" to select the Switch */
    await SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Spacebar);
    await SwitchPageObject.waitForSwitchChecked(PAGE_TIMEOUT);

    await expect(await SwitchPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Switch is toggled ON */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeTruthy();
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);

    await SwitchPageObject.sendKey(SwitchComponentSelector.PrimaryComponent, Keys.Spacebar);

    /* Validate the Switch is toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy();
    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });
});
