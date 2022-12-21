import { SPACING_TESTPAGE, HOMEPAGE_SPACING_BUTTON } from '../../../../fluent-tester/src/TestComponents/Spacing/consts';
import { BasePage, By } from '../../common/BasePage';

class SpacingTokensPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SPACING_TESTPAGE);
  }

  get _pageName() {
    return SPACING_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_SPACING_BUTTON);
  }
}

export default new SpacingTokensPageObject();
