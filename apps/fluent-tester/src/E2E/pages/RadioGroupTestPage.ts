import { RADIOGROUP_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class RadioGroupPage extends BasePage {
  get _testPage() {
    return By(RADIOGROUP_TESTPAGE);
  }
}

export default new RadioGroupPage();
