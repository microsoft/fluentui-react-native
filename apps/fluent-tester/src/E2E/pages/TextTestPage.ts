import { TEXT_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class TextTestPage extends BasePage {
  get _testPage() {
    return By(TEXT_TESTPAGE);
  }
}

export default new TextTestPage();
