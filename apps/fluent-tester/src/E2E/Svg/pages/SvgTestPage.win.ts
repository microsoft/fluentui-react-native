import { SVG_TESTPAGE } from '../../../RNTester/TestComponents/Svg/consts';
import { BasePage, By } from '../../common/BasePage';

class SvgTestPage extends BasePage {
  get _testPage() {
    return By(SVG_TESTPAGE);
  }
}

export default new SvgTestPage();
