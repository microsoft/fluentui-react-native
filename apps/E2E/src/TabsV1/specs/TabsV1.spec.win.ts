import TabsV1PageObject from '../pages/TabsV1PageObject';
import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TabsV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to TabsV1 test page', async () => {
    await TabsV1PageObject.navigateToPageAndLoadTests(true);

    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('TabsV1 Accessibility Testing', () => {
  it("Validate TabsItem's accessibilityRole is correct", async () => {
    await TabsV1PageObject.scrollToTestElement();

    await expect(await TabsV1PageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate TabsItem's accessibilityRole is correct", async () => {
    await TabsV1PageObject.scrollToTestElement();

    await expect(await TabsV1PageObject.getTabItemAccesibilityRole()).toEqual(TABITEM_A11Y_ROLE);
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
