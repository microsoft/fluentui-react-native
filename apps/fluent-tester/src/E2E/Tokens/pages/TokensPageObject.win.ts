import { HOMEPAGE_TOKEN_BUTTON, TOKEN_TESTPAGE, TOKENS_TEST_COMPONENT } from '../../../TestComponents/Tokens/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class TokenPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(TOKEN_TESTPAGE);
  }

  get _pageName() {
    return TOKEN_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(TOKENS_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_TOKEN_BUTTON);
  }
}

export default new TokenPageObject();
