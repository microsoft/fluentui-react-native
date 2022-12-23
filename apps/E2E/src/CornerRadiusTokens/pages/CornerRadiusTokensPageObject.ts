import {
  HOMEPAGE_CORNERRADIUS_TESTPAGE,
  HOMEPAGE_CORNERRADIUS_BUTTON,
} from '../../../../fluent-tester/src/TestComponents/CornerRadius/consts';
import { BasePage, By } from '../../common/BasePage';

class CornerRadiusTokensPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(HOMEPAGE_CORNERRADIUS_TESTPAGE);
  }

  get _pageName() {
    return HOMEPAGE_CORNERRADIUS_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_CORNERRADIUS_BUTTON);
  }
}

export default new CornerRadiusTokensPageObject();
