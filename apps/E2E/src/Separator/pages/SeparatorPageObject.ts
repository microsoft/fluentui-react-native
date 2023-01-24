import { SEPARATOR_TESTPAGE, SEPARATOR_TEST_COMPONENT, HOMEPAGE_SEPARATOR_BUTTON } from '../consts';
import { BasePage } from '../../common/BasePage';

class SeparatorPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SEPARATOR_TESTPAGE;
  }

  get _primaryComponentName() {
    return SEPARATOR_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_SEPARATOR_BUTTON;
  }
}

export default new SeparatorPageObject();
