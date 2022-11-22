import { HOMEPAGE_TOKEN_BUTTON, TOKEN_TESTPAGE, TOKENS_TEST_COMPONENT } from '../../../../fluent-tester/src/TestComponents/Tokens/consts';
import { BasePage, By } from '../../common/BasePage';

class TokenPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(TOKEN_TESTPAGE);
  }

  get _pageName() {
    return TOKEN_TESTPAGE;
  }

  get _primaryComponent() {
    return By(TOKENS_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TOKEN_BUTTON);
  }
}

export default new TokenPageObject();
