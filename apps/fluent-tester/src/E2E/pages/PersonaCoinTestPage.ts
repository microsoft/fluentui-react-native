import { PERSONACOIN_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class PersonaCoinTestPage extends BasePage {
  get _testPage() {
    return By(PERSONACOIN_TESTPAGE);
  }
}

export default new PersonaCoinTestPage();
