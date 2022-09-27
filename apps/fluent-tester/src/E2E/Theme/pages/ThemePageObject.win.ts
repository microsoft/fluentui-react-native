import { THEME_TESTPAGE, THEME_TEST_COMPONENT, HOMEPAGE_THEME_BUTTON } from '../../../TestComponents/Theme/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class ThemePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(THEME_TESTPAGE);
  }

  get _pageName() {
    return THEME_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(THEME_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_THEME_BUTTON);
  }
}

export default new ThemePageObject();
