import {
  TABS_TESTPAGE,
  TABS_TEST_COMPONENT,
  TABS_ITEM_TEST_COMPONENT,
  HOMEPAGE_TABS_BUTTON,
} from '../../../FluentTester/TestComponents/Tabs/consts';
import { BasePage, By } from '../../common/BasePage.win';

class TabsPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  getTabItemAccesibilityRole(): string {
    return this._tabItem.getAttribute('ControlType');
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

  /***********/
  /* TabItem *
  /***********/
  get _tabItem() {
    return By(TABS_ITEM_TEST_COMPONENT);
  }
}

export default new TabsPageObject();
