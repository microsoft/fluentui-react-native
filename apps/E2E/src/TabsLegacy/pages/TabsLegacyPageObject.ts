import { BasePage, By } from '../../common/BasePage';
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
} from '../consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page.
 * The main Tab group we are testing has THREE tab items. The spec file will
 * import this enum to easily write tests using these 3 tab items */
type TabItem =
  | 'First' // this._firstTabItem
  | 'Second' // this._secondTabItem
  | 'Third'; // this._thirdTabItem

class TabsLegacyPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  async waitForTabItemContentToLoad(tabItemSelector: TabItem, errorMsg: string): Promise<boolean | void> {
    const content = await this.getTabItemContent(tabItemSelector);
    return await this.waitForCondition(async () => await content.isDisplayed(), errorMsg);
  }

  /* Returns the correct WebDriverIO element from the TabItem Selector */
  async getTabItem(tabItemSelector: TabItem): Promise<WebdriverIO.Element> {
    switch (tabItemSelector) {
      case 'First':
        return await By(FIRST_TABS_ITEM);
      case 'Second':
        return await By(SECOND_TABS_ITEM);
      case 'Third':
        return await By(THIRD_TABS_ITEM);
    }
  }

  /* Returns the correct WebDriverIO element from the TabItem Selector */
  async getTabItemContent(tabItemSelector: TabItem): Promise<WebdriverIO.Element> {
    switch (tabItemSelector) {
      case 'First':
        return await By(FIRST_TABS_ITEM_CONTENT);
      case 'Second':
        return await By(SECOND_TABS_ITEM_CONTENT);
      case 'Third':
        return await By(THIRD_TABS_ITEM_CONTENT);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return TABS_TESTPAGE;
  }

  get _primaryComponentName() {
    return TABS_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_TABS_BUTTON;
  }
}

export default new TabsLegacyPageObject();
