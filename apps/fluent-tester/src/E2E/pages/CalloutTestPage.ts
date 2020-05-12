import { CALLOUT_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class CalloutTestPage {
  isPageLoaded(): boolean {
    return this._calloutPage.isDisplayed();
  }
  get _calloutPage() {
    return By(CALLOUT_TESTPAGE);
  }
}

export default new CalloutTestPage();
