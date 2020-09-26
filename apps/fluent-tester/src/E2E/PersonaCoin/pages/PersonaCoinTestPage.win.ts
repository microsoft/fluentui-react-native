import { PERSONACOIN_TESTPAGE } from '../../../FluentTester/TestComponents/PersonaCoin/consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaCoinTestPage extends BasePage {
  get _testPage() {
    return By(PERSONACOIN_TESTPAGE);
  }

  get _pageName() {
    return PERSONACOIN_TESTPAGE;
  }
}

export default new PersonaCoinTestPage();
