import { THEME_TESTPAGE } from '../../../RNTester/TestComponents/Theme/consts';
import { BasePage, By } from '../../common/BasePage';

class ThemeTestPage extends BasePage {
  get _testPage() {
    return By(THEME_TESTPAGE);
  }
}

export default new ThemeTestPage();
