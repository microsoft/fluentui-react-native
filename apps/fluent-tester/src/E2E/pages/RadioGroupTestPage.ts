import { RADIOGROUP_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class RadioGroupPage {
  isPageLoaded(): boolean {
    return this._radioGroupPage.isDisplayed();
  }
  get _radioGroupPage() {
    return By(RADIOGROUP_TESTPAGE);
  }
}

export default new RadioGroupPage();
