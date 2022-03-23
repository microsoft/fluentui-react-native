import {
  BUTTON_TESTPAGE,
  BUTTON_TEST_COMPONENT_DEPRECATED,
  BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED,
  HOMEPAGE_BUTTON_BUTTON,
} from '../../../TestComponents/Button/consts';
import { BasePage, By } from '../../common/BasePage.macos';

class ButtonPageObject extends BasePage {
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
    return By(BUTTON_TEST_COMPONENT_DEPRECATED);
  }

  get _secondaryComponent() {
    return By(BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED);
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }
}

export default new ButtonPageObject();
