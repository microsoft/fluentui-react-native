import { LINK_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class LinkTestPage extends BasePage {
  get _testPage() {
    return By(LINK_TESTPAGE);
  }
}

export default new LinkTestPage();
