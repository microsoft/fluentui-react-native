import { SVG_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class SvgTestPage extends BasePage {
  get _testPage() {
    return By(SVG_TESTPAGE);
  }
}

export default new SvgTestPage();
