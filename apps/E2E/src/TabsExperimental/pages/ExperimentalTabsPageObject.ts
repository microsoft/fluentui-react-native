import {
  EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT,
  EXPERIMENTAL_TABS_TESTPAGE,
  EXPERIMENTAL_TABS_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
} from '../../../../fluent-tester/src/TestComponents/TabsExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalTabsPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async getTabItemAccesibilityRole(): Promise<string> {
    return await (await this._tabItem).getAttribute('ControlType');
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_TABS_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_TABS_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_TABS_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_TABS_BUTTON);
  }

  /***********/
  /* TabItem *
  /***********/
  get _tabItem() {
    return By(EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT);
  }
}

export default new ExperimentalTabsPageObject();
