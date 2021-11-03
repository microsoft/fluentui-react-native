import { LINK_TESTPAGE, HOMEPAGE_LINK_BUTTON } from '../../../FluentTester/TestComponents/Link/consts';
import { BasePage, By } from '../../common/BasePage';

class LinkTestPage extends BasePage {
  get _testPage() {
    return By(LINK_TESTPAGE);
  }

  get _pageName() {
    return LINK_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_LINK_BUTTON);
  }
}

export default new LinkTestPage();
