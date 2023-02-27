import { BasePage } from '../../common/BasePage';
import { SVG_TESTPAGE, SVG_TEST_COMPONENT, HOMEPAGE_SVG_BUTTON } from '../consts';

class SvgPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SVG_TESTPAGE;
  }

  get _primaryComponentName() {
    return SVG_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_SVG_BUTTON;
  }
}

export default new SvgPageObject();
