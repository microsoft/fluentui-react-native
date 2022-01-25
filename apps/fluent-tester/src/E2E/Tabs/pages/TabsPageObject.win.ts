import {
  TABS_TESTPAGE,
  TABS_TEST_COMPONENT,
  HOMEPAGE_TABS_BUTTON,
  SECOND_TABS_ITEM_CONTENT,
  FIRST_TABS_ITEM,
  FIRST_TABS_ITEM_CONTENT,
  SECOND_TABS_ITEM,
  THIRD_TABS_ITEM,
  THIRD_TABS_ITEM_CONTENT,
} from '../../../FluentTester/TestComponents/Tabs/consts';
import { BasePage, By } from '../../common/BasePage.win';

/* The main Tab group we are testing has THREE tab items. The spec file will
 * import this enum to easily write tests using these 3 tab items */
export const enum TabItemSelector {
  First = 0, // this._firstTabItem
  Second, // this._secondTabItem
  Third, // this._thirdTabItem
}

class TabsPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  waitForTabsItemsToOpen(tabItemSelector: TabItemSelector, timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.didTabItemContentLoad(tabItemSelector);
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: 'The Tab Items content did not open.',
        interval: 1000,
      },
    );
  }

  getTabItemAccesibilityRole(tabItemSelector: TabItemSelector): string {
    return this.getTabItem(tabItemSelector).getAttribute('ControlType');
  }

  clickOnTabItem(tabItemSelector: TabItemSelector): void {
    this.getTabItem(tabItemSelector).click();
  }

  didTabItemContentLoad(tabItemSelector: TabItemSelector): boolean {
    return this.getTabItemContent(tabItemSelector).isDisplayed();
  }

  /* Returns the correct WebDriverIO element from the TabItem Selector */
  getTabItem(tabItemSelector: TabItemSelector): WebdriverIO.Element {
    if (tabItemSelector == TabItemSelector.First) {
      return this._firstTabItem;
    } else if (tabItemSelector == TabItemSelector.Second) {
      return this._secondTabItem;
    } else {
      return this._thirdTabItem;
    }
  }

  /* Returns the correct WebDriverIO element from the TabItem Selector */
  getTabItemContent(tabItemSelector: TabItemSelector): WebdriverIO.Element {
    if (tabItemSelector == TabItemSelector.First) {
      return this._firstTabItemContent;
    } else if (tabItemSelector == TabItemSelector.Second) {
      return this._secondTabItemContent;
    } else {
      return this._thirdTabItemContent;
    }
  }

  /* Sends a Keyboarding command on a specific UI element */
  sendKey(key?: string, tabItemSelector?: TabItemSelector): void {
    this.getTabItem(tabItemSelector).addValue(key);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(TABS_TESTPAGE);
  }

  get _pageName() {
    return TABS_TESTPAGE;
  }

  get _primaryComponent() {
    return By(TABS_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TABS_BUTTON);
  }

  /* The first tab group has 3 Tab item headers, all listed below */
  get _firstTabItem() {
    return By(FIRST_TABS_ITEM);
  }

  get _secondTabItem() {
    return By(SECOND_TABS_ITEM);
  }

  get _thirdTabItem() {
    return By(THIRD_TABS_ITEM);
  }

  /* Content shown when tab item is clicked */
  get _firstTabItemContent() {
    return By(FIRST_TABS_ITEM_CONTENT);
  }

  get _secondTabItemContent() {
    return By(SECOND_TABS_ITEM_CONTENT);
  }

  get _thirdTabItemContent() {
    return By(THIRD_TABS_ITEM_CONTENT);
  }
}

export default new TabsPageObject();
