import { SEPARATOR_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class SeparatorTestPage {
  isPageLoaded(): boolean {
    return this._separatorPage.isDisplayed();
  }
  get _separatorPage() {
    return By(SEPARATOR_TESTPAGE);
  }
}

export default new SeparatorTestPage();
