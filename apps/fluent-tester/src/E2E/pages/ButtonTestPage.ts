import { BUTTON_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class ButtonTestPage extends BasePage {
  get _testPage() {
    return By(BUTTON_TESTPAGE);
  }
}

export default new ButtonTestPage();
