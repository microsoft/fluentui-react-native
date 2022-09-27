import { HOMEPAGE_SHIMMER_BUTTON, SHIMMER_TESTPAGE, SHIMMER_TEST_COMPONENT } from '../../../TestComponents/Shimmer/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class ShimmerPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(SHIMMER_TESTPAGE);
  }

  get _pageName() {
    return SHIMMER_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(SHIMMER_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_SHIMMER_BUTTON);
  }
}

export default new ShimmerPageObject();
