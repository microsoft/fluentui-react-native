import { HOMEPAGE_SHIMMER_BUTTON, SHIMMER_TESTPAGE, SHIMMER_TEST_COMPONENT } from '../../../FluentTester/TestComponents/Shimmer/consts';
import { BasePage, By } from '../../common/BasePage.win';

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

  get _primaryComponent() {
    return By(SHIMMER_TEST_COMPONENT);
  }

  // get _secondaryComponent() {
  //   return By(BUTTON_NO_A11Y_LABEL_COMPONENT);
  // }

  get _pageButton() {
    return By(HOMEPAGE_SHIMMER_BUTTON);
  }
}

export default new ShimmerPageObject();
