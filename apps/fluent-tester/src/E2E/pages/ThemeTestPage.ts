import { THEME_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class ThemeTestPage extends BasePage {
  get _testPage() {
    return By(THEME_TESTPAGE);
  }
}

export default new ThemeTestPage();
