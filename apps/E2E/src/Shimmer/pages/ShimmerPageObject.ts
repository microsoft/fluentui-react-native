import { BasePage } from '../../common/BasePage';
import { HOMEPAGE_SHIMMER_BUTTON, SHIMMER_TESTPAGE, SHIMMER_TEST_COMPONENT } from '../consts';

class ShimmerPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SHIMMER_TESTPAGE;
  }

  get _primaryComponentName() {
    return SHIMMER_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_SHIMMER_BUTTON;
  }
}

export default new ShimmerPageObject();
