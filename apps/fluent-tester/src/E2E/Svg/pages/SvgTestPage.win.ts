import { SVG_TESTPAGE, HOMEPAGE_SVG_BUTTON } from '../../../FluentTester/TestComponents/Svg/consts';
import { BasePage, By } from '../../common/BasePage';

class SvgTestPage extends BasePage {
  get _testPage() {
    return By(SVG_TESTPAGE);
  }

  get _pageName() {
    return SVG_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_SVG_BUTTON);
  }
}

export default new SvgTestPage();
