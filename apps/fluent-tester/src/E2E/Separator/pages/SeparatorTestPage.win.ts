import { SEPARATOR_TESTPAGE, HOMEPAGE_SEPARATOR_BUTTON } from '../../../FluentTester/TestComponents/Separator/consts';
import { BasePage, By } from '../../common/BasePage';

class SeparatorTestPage extends BasePage {
  get _testPage() {
    return By(SEPARATOR_TESTPAGE);
  }

  get _pageName() {
    return SEPARATOR_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_SEPARATOR_BUTTON);
  }
}

export default new SeparatorTestPage();
