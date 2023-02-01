import NavigateAppPage from '../../common/NavigateAppPage';
import TabsV1PageObject, { TabItem } from '../pages/TabsV1PageObject';
import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT, Attribute, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TabsV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsV1Page();
    await TabsV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsV1PageObject.isPageLoaded()).toBeTruthy(TabsV1PageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('TabsV1 Accessibility Testing', () => {
  it('Validate Tab\'s "accessibilityRole" defaults to "ControlType.Tab".', async () => {
    await expect(
      await TabsV1PageObject.compareAttribute(TabsV1PageObject._primaryComponent, Attribute.AccessibilityRole, TAB_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate TabItem\'s "accessibilityRole" defaults to "ControlType.TabItem".', async () => {
    await expect(
      await TabsV1PageObject.compareAttribute(TabsV1PageObject.getTabItem(TabItem.First), Attribute.AccessibilityRole, TABITEM_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('TabsV1 Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsV1PageObject.scrollToTestElement();

    // Reset the TabGroup by putting focus on First tab item
    await TabsV1PageObject.click(TabsV1PageObject.getTabItem(TabItem.First));
  });

  it('Click on the second tab header. Validate the second TabItem content is shown.', async () => {
    await TabsV1PageObject.click(TabsV1PageObject.getTabItem(TabItem.Second));

    await expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        TabItem.Second,
        "Expected the second tab item's content to show by clicking the second tab item.",
      ),
    ).toBeTruthy();
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Input the following arrow keys on the tabs: Right -> Down -> Left -> Up. Validate the correct TabItem content gets shown.', async () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem(TabItem.First), [Keys.ARROW_RIGHT]);

    await expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        TabItem.Second,
        'Expected the second tab item\'s content to show by pressing "Right Arrow" on the first tab item.',
      ),
    ).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem(TabItem.Second), [Keys.ARROW_DOWN]);

    await expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        TabItem.Third,
        'Expected the third tab item\'s content to show by pressing "Down Arrow" on the second tab item.',
      ),
    ).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem(TabItem.Third), [Keys.ARROW_LEFT]);

    await expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        TabItem.Second,
        'Expected the second tab item\'s content to show by pressing "Left Arrow" on the third tab item.',
      ),
    ).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem(TabItem.Second), [Keys.ARROW_UP]);

    await expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        TabItem.First,
        'Expected the first tab item\'s content to show by pressing "Up Arrow" on the first tab item.',
      ),
    ).toBeTruthy();
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
