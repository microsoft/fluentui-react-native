import {
  MENU_BUTTON_EXPERIMENTAL_TESTPAGE,
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_MENU_BUTTON,
  EXPERIMENTAL_MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/MenuButtonExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalMenuButtonPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(MENU_BUTTON_EXPERIMENTAL_TESTPAGE);
  }

  get _pageName() {
    return MENU_BUTTON_EXPERIMENTAL_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(EXPERIMENTAL_MENU_BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_MENU_BUTTON);
  }
}

export default new ExperimentalMenuButtonPageObject();
