import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonPageObject from '../pages/MenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to MenuButton test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    MenuButtonPageObject.scrollToComponentButton();
    MenuButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToMenuButtonPage();
    MenuButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(MenuButtonPageObject.isPageLoaded()).toBeTruthy();
  });
});

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
// describe('MenuButton Accessibility Testing', () => {
//   it('Validate accessibilityRole is correct', () => {
//     MenuButtonPageObject.scrollToTestElement();
//     MenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
//     expect(MenuButtonPageObject.getAccessibilityRole()).toEqual(MENUBUTTON_A11Y_ROLE);
//   });

//   it('Set accessibilityLabel', () => {
//     MenuButtonPageObject.scrollToTestElement();
//     MenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
//     expect(MenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(MENU_BUTTON_ACCESSIBILITY_LABEL);
//   });

//   it('Do not set accessibilityLabel -> Default to MenuButton label', () => {
//     MenuButtonPageObject.scrollToTestElement();
//     MenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
//     expect(MenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(MENU_BUTTON_TEST_COMPONENT_LABEL);
//   });
// });
