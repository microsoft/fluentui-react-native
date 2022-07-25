import { TABS_TESTPAGE, TABS_TEST_COMPONENT, FIRST_TABS_ITEM, HOMEPAGE_TABS_BUTTON } from '../../../TestComponents/Tabs/consts';
import { BasePage, By } from '../../common/BasePage.macos';

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
    return By(FIRST_TABS_ITEM);
  }
}

export default new TabsPageObject();
