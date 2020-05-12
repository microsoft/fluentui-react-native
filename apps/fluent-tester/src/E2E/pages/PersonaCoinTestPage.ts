import { PERSONACOIN_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class PersonaCoinTestPage {
  isPageLoaded(): boolean {
    return this._personaCoinTestPage.isDisplayed();
  }
  get _personaCoinTestPage() {
    return By(PERSONACOIN_TESTPAGE);
  }
}

export default new PersonaCoinTestPage();
