import { STROKEWIDTH_TESTPAGE, HOMEPAGE_STROKEWIDTH_BUTTON } from '../../../../fluent-tester/src/TestComponents/StrokeWidth/consts';
import { BasePage, By } from '../../common/BasePage';

class StrokeWidthTokensPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(STROKEWIDTH_TESTPAGE);
  }

  get _pageName() {
    return STROKEWIDTH_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_STROKEWIDTH_BUTTON);
  }
}

export default new StrokeWidthTokensPageObject();
