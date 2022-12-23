import {
  TABS_TESTPAGE,
  TABS_TEST_COMPONENT,
  HOMEPAGE_TABS_BUTTON,
  FIRST_TABS_ITEM,
  SECOND_TABS_ITEM,
  THIRD_TABS_ITEM,
  FIRST_TABS_ITEM_CONTENT,
  SECOND_TABS_ITEM_CONTENT,
  THIRD_TABS_ITEM_CONTENT,
} from '../../../../fluent-tester/src/TestComponents/Tabs/consts';
import { BasePage, By } from '../../common/BasePage';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page.
 * The main Tab group we are testing has THREE tab items. The spec file will
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
  async waitForTabsItemsToOpen(tabItemSelector: TabItemSelector, timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.didTabItemContentLoad(tabItemSelector), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'The Tab Items content did not open.',
      interval: 1000,
    });
  }

  async getTabItemAccesibilityRole(tabItemSelector: TabItemSelector): Promise<string> {
    return await (await this.getTabItem(tabItemSelector)).getAttribute('ControlType');
  }

  async clickOnTabItem(tabItemSelector: TabItemSelector): Promise<void> {
    await (await this.getTabItem(tabItemSelector)).click();
  }

  async didTabItemContentLoad(tabItemSelector: TabItemSelector): Promise<boolean> {
    return await (await this.getTabItemContent(tabItemSelector)).isDisplayed();
  }

  /* Returns the correct WebDriverIO element from the TabItem Selector */
  async getTabItem(tabItemSelector: TabItemSelector): Promise<WebdriverIO.Element> {
    if (tabItemSelector == TabItemSelector.First) {
      return await this._firstTabItem;
    } else if (tabItemSelector == TabItemSelector.Second) {
      return await this._secondTabItem;
    } else {
      return await this._thirdTabItem;
    }
  }

  /* Returns the correct WebDriverIO element from the TabItem Selector */
  async getTabItemContent(tabItemSelector: TabItemSelector): Promise<WebdriverIO.Element> {
    if (tabItemSelector == TabItemSelector.First) {
      return await this._firstTabItemContent;
    } else if (tabItemSelector == TabItemSelector.Second) {
      return await this._secondTabItemContent;
    } else {
      return await this._thirdTabItemContent;
    }
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(key: string, tabItemSelector: TabItemSelector): Promise<void> {
    await (await this.getTabItem(tabItemSelector)).addValue(key);
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
