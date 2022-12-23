import { SVG_TESTPAGE, SVG_TEST_COMPONENT, HOMEPAGE_SVG_BUTTON } from '../../../../fluent-tester/src/TestComponents/Svg/consts';
import { BasePage, By } from '../../common/BasePage';

class SvgPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SVG_TESTPAGE);
  }

  get _pageName() {
    return SVG_TESTPAGE;
  }

  get _primaryComponent() {
    return By(SVG_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_SVG_BUTTON);
  }
}

export default new SvgPageObject();
