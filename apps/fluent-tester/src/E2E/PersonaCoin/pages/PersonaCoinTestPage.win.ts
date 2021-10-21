import { PERSONACOIN_TESTPAGE, HOMEPAGE_PERSONACOIN_BUTTON } from '../../../FluentTester/TestComponents/PersonaCoin/consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaCoinTestPage extends BasePage {
  get _testPage() {
    return By(PERSONACOIN_TESTPAGE);
  }

  get _pageName() {
    return PERSONACOIN_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_PERSONACOIN_BUTTON);
  }
}

export default new PersonaCoinTestPage();
