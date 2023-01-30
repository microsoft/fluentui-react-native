import { TABSITEMV1_TEST_COMPONENT, TABSV1_TESTPAGE, TABSV1_TEST_COMPONENT, HOMEPAGE_TABSV1_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class TabsV1PageObject extends BasePage {
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

  /***********/
  /* TabItem *
  /***********/
  get _tabItem() {
    return By(TABSITEMV1_TEST_COMPONENT);
  }
}

export default new TabsV1PageObject();
