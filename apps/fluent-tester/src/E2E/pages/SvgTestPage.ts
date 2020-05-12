import { SVG_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class SvgTestPage {
  isPageLoaded(): boolean {
    return this._svgPage.isDisplayed();
  }
  get _svgPage() {
    return By(SVG_TESTPAGE);
  }
}

export default new SvgTestPage();
