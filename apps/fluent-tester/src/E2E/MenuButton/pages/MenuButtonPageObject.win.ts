import {
  MENU_BUTTON_TESTPAGE,
  MENU_BUTTON_TEST_COMPONENT,
  HOMEPAGE_MENU_BUTTON,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
} from '../../../FluentTester/TestComponents/MenuButton/consts';
import { BasePage, By } from '../../common/BasePage';

class MenuButtonPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(MENU_BUTTON_TESTPAGE);
  }

  get _pageName() {
    return MENU_BUTTON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(MENU_BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(MENU_BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_MENU_BUTTON);
  }
}

export default new MenuButtonPageObject();
