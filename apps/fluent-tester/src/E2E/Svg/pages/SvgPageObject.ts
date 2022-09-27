import { SVG_TESTPAGE, SVG_TEST_COMPONENT, HOMEPAGE_SVG_BUTTON } from '../../../TestComponents/Svg/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class SvgPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(SVG_TESTPAGE);
  }

  get _pageName() {
    return SVG_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(SVG_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_SVG_BUTTON);
  }
}

export default new SvgPageObject();
