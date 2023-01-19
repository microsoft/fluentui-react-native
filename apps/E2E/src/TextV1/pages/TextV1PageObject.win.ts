import { TEXTV1_NO_A11Y_LABEL_COMPONENT, TEXTV1_TESTPAGE, TEXTV1_TEST_COMPONENT, HOMEPAGE_TEXTV1_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class TextV1PageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return TEXTV1_TESTPAGE;
  }

  get _primaryComponent() {
    return By(TEXTV1_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(TEXTV1_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_TEXTV1_BUTTON;
  }
}

export default new TextV1PageObject();
