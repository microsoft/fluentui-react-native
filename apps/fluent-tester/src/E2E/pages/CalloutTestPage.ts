import { CALLOUT_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class CalloutTestPage extends BasePage {
  get _testPage() {
    return By(CALLOUT_TESTPAGE);
  }
}

export default new CalloutTestPage();
