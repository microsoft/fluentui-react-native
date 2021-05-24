import { CONTEXTUALMENU_TESTPAGE } from '../../../FluentTester/TestComponents/ContextualMenu/consts';
import { BasePage, By } from '../../common/BasePage';

class ContextualMenuPage extends BasePage {
  get _testPage() {
    return By(CONTEXTUALMENU_TESTPAGE);
  }

  get _pageName() {
    return CONTEXTUALMENU_TESTPAGE;
  }
}

export default new ContextualMenuPage();
