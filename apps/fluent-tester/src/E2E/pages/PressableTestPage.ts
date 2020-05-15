import { PRESSABLE_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class PressableTestPage extends BasePage {
  get _testPage() {
    return By(PRESSABLE_TESTPAGE);
  }
}

export default new PressableTestPage();
