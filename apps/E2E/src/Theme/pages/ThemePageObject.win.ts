import { THEME_TESTPAGE, THEME_TEST_COMPONENT, HOMEPAGE_THEME_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class ThemePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return THEME_TESTPAGE;
  }

  get _primaryComponent() {
    return By(THEME_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_THEME_BUTTON;
  }
}

export default new ThemePageObject();
