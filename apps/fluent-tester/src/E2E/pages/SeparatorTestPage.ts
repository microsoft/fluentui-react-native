import { SEPARATOR_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class SeparatorTestPage extends BasePage {
  get _testPage() {
    return By(SEPARATOR_TESTPAGE);
  }
}

export default new SeparatorTestPage();
