import { PRESSABLE_TESTPAGE } from '../../../RNTester/TestComponents/Pressable/consts';
import { BasePage, By } from '../../common/BasePage';

class PressableTestPage extends BasePage {
  get _testPage() {
    return By(PRESSABLE_TESTPAGE);
  }
}

export default new PressableTestPage();
