import { HOMEPAGE_COLORTOKEN_BUTTON, COLORTOKEN_TESTPAGE, COLORTOKENS_TEST_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class TokenPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(COLORTOKEN_TESTPAGE);
  }

  get _pageName() {
    return COLORTOKEN_TESTPAGE;
  }

  get _primaryComponent() {
    return By(COLORTOKENS_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_COLORTOKEN_BUTTON);
  }
}

export default new TokenPageObject();
