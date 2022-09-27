import {
  MENU_BUTTON_EXPERIMENTAL_TESTPAGE,
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_MENU_BUTTON,
  EXPERIMENTAL_MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
} from '../../../TestComponents/MenuButtonExperimental/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class ExperimentalMenuButtonPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(MENU_BUTTON_EXPERIMENTAL_TESTPAGE);
  }

  get _pageName() {
    return MENU_BUTTON_EXPERIMENTAL_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return GetElement(EXPERIMENTAL_MENU_BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_EXPERIMENTAL_MENU_BUTTON);
  }
}

export default new ExperimentalMenuButtonPageObject();
