// import NavigateAppPage from '../../common/NavigateAppPage.macos';
// import BasicBadgePageObject from '../pages/BasicBadgePageObject.macos';
// import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// // Before testing begins, allow up to 60 seconds for app to open
// describe('Badge Testing Initialization', function () {
//   it('Wait for app load', () => {
//     NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
//     expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
//   });

//   it('Click and navigate to Badge test page', () => {
//     /* Scroll to component test page button in scrollview if not already visible*/
//     BasicBadgePageObject.scrollToComponentButton();
//     BasicBadgePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

//     /* Click on component button to navigate to test page */
//     NavigateAppPage.clickAndGoToBadgePage();
//     BasicBadgePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

//     expect(BasicBadgePageObject.isPageLoaded()).toBeTruthy();
//   });
// });
