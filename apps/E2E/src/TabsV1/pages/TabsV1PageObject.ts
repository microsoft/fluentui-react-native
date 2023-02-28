import { BasePage, By } from '../../common/BasePage';
import {
  TABSV1_TESTPAGE,
  TABSV1_TEST_COMPONENT,
  HOMEPAGE_TABSV1_BUTTON,
  TABSITEMV1_ITEM_1,
  TABSITEMV1_ITEM_2,
  TABSITEMV1_ITEM_3,
  TABSITEMV1_CONTENT_1,
  TABSITEMV1_CONTENT_2,
  TABSITEMV1_CONTENT_3,
} from '../consts';

export type TabItem = 'First' | 'Second' | 'Third';

class TabsV1PageObject extends BasePage {
  async waitForTabItemContentToLoad(selector: TabItem, errorMsg: string): Promise<boolean> {
    const content = await this.getTabItemContent(selector);
    await this.waitForCondition(async () => await content.isDisplayed(), errorMsg);
    return await content.isDisplayed();
  }

  async getTabItem(selector: TabItem): Promise<WebdriverIO.Element> {
    switch (selector) {
      case 'First':
        return await By(TABSITEMV1_ITEM_1);
      case 'Second':
        return await By(TABSITEMV1_ITEM_2);
      case 'Third':
        return await By(TABSITEMV1_ITEM_3);
    }
  }

  async getTabItemContent(selector: TabItem): Promise<WebdriverIO.Element> {
    switch (selector) {
      case 'First':
        return await By(TABSITEMV1_CONTENT_1);
      case 'Second':
        return await By(TABSITEMV1_CONTENT_2);
      case 'Third':
        return await By(TABSITEMV1_CONTENT_3);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return TABSV1_TESTPAGE;
  }

  get _primaryComponentName() {
    return TABSV1_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_TABSV1_BUTTON;
  }
}

export default new TabsV1PageObject();
