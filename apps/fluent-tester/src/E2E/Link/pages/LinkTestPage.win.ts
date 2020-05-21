import { LINK_TESTPAGE } from '../../../RNTester/TestComponents/Link/consts';
import { BasePage, By } from '../../common/BasePage';

class LinkTestPage extends BasePage {
  get _testPage() {
    return By(LINK_TESTPAGE);
  }
}

export default new LinkTestPage();
