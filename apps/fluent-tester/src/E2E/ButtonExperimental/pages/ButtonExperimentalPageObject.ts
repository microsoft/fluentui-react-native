import {
  EXPERIMENTAL_BUTTON_TEST_PAGE,
  BUTTONEXPERIMENTAL_TEST_COMPONENT,
  BUTTONEXPERIMENTAL_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_BUTTON_BUTTONEXPERIMENTAL,
} from '../../../FluentTester/TestComponents/ButtonExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ButtonExperimentalPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_BUTTON_TEST_PAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_BUTTON_TEST_PAGE;
  }

  get _primaryComponent() {
    return By(BUTTONEXPERIMENTAL_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(BUTTONEXPERIMENTAL_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTONEXPERIMENTAL);
  }
}

export default new ButtonExperimentalPageObject();
