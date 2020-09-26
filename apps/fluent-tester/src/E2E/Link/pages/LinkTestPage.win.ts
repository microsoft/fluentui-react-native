import { LINK_TESTPAGE } from '../../../FluentTester/TestComponents/Link/consts';
import { BasePage, By } from '../../common/BasePage';

class LinkTestPage extends BasePage {
  get _testPage() {
    return By(LINK_TESTPAGE);
  }

  get _pageName() {
    return LINK_TESTPAGE;
  }
}

export default new LinkTestPage();
