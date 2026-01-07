import { BasePage, By } from '../../common/BasePage';
import {
  MENUBUTTONV1_TESTPAGE,
  MENUBUTTONV1_TEST_COMPONENT,
  HOMEPAGE_MENUBUTTONV1_BUTTON,
  MENUBUTTONV1_NO_A11Y_LABEL_COMPONENT,
} from '../consts';

class MenuButtonV1PageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return MENUBUTTONV1_TESTPAGE;
  }

  get _firstMenuButton(): ChainablePromiseElement {
    return By(MENUBUTTONV1_TEST_COMPONENT);
  }

  get _secondMenuButton(): ChainablePromiseElement {
    return By(MENUBUTTONV1_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_MENUBUTTONV1_BUTTON;
  }
}

export default new MenuButtonV1PageObject();
