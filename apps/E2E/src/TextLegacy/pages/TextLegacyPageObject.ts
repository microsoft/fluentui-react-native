import { BasePage, By } from '../../common/BasePage';
import { TEXT_TESTPAGE, HOMEPAGE_TEXT_BUTTON, DEPRECATED_TEXT_FIRST_COMPONENT, DEPRECATED_TEXT_SECOND_COMPONENT } from '../consts';
class TextLegacyPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return TEXT_TESTPAGE;
  }

  get _deprecatedFirstComponent(): ChainablePromiseElement {
    return By(DEPRECATED_TEXT_FIRST_COMPONENT);
  }

  get _deprecatedSecondComponent(): ChainablePromiseElement {
    return By(DEPRECATED_TEXT_SECOND_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_TEXT_BUTTON;
  }
}

export default new TextLegacyPageObject();
