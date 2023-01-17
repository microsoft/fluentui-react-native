import { HOMEPAGE_TOKEN_BUTTON, TOKEN_TESTPAGE, TOKENS_TEST_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class TokenPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return TOKEN_TESTPAGE;
  }

  get _primaryComponent() {
    return By(TOKENS_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_TOKEN_BUTTON;
  }
}

export default new TokenPageObject();
