import { HOMEPAGE_SHIMMER_BUTTON, SHIMMER_TESTPAGE, SHIMMER_TEST_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class ShimmerPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SHIMMER_TESTPAGE);
  }

  get _pageName() {
    return SHIMMER_TESTPAGE;
  }

  get _primaryComponentName() {
    return SHIMMER_TEST_COMPONENT;
  }

  get _pageButton() {
    return By(HOMEPAGE_SHIMMER_BUTTON);
  }
}

export default new ShimmerPageObject();
