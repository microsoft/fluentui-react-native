import { CALLOUT_TESTPAGE } from '../../../RNTester/TestComponents/Callout/consts';
import { BasePage, By } from '../../common/BasePage';

class CalloutTestPage extends BasePage {
  get _testPage() {
    return By(CALLOUT_TESTPAGE);
  }
}

export default new CalloutTestPage();
