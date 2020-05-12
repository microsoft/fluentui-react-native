import { THEME_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class ThemeTestPage {
  isPageLoaded(): boolean {
    return this._themePage.isDisplayed();
  }
  get _themePage() {
    return By(THEME_TESTPAGE);
  }
}

export default new ThemeTestPage();
