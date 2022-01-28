import {
  BUTTON_TESTPAGE,
  BUTTONEXPERIMENTAL_TEST_COMPONENT,
  BUTTONEXPERIMENTAL_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_BUTTON_BUTTON,
} from '../../../FluentTester/TestComponents/Button/consts';
import { BasePage, By } from '../../common/BasePage.win';

class ButtonExperimentalPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(BUTTON_TESTPAGE);
  }

  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(BUTTONEXPERIMENTAL_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(BUTTONEXPERIMENTAL_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }
}

export default new ButtonExperimentalPageObject();
