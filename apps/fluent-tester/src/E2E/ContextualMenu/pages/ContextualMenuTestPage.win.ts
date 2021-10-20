import { CONTEXTUALMENU_TESTPAGE, HOMEPAGE_CONTEXTUALMENU_BUTTON } from '../../../FluentTester/TestComponents/ContextualMenu/consts';
import { BasePage, By } from '../../common/BasePage';

class ContextualMenuPage extends BasePage {
  get _testPage() {
    return By(CONTEXTUALMENU_TESTPAGE);
  }

  get _pageName() {
    return CONTEXTUALMENU_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_CONTEXTUALMENU_BUTTON);
  }
}

export default new ContextualMenuPage();
