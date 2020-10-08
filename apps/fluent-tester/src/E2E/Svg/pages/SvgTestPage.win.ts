import { SVG_TESTPAGE } from '../../../FluentTester/TestComponents/Svg/consts';
import { BasePage, By } from '../../common/BasePage';

class SvgTestPage extends BasePage {
  get _testPage() {
    return By(SVG_TESTPAGE);
  }

  get _pageName() {
    return SVG_TESTPAGE;
  }
}

export default new SvgTestPage();
