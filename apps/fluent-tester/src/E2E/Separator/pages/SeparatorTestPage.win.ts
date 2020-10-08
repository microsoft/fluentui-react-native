import { SEPARATOR_TESTPAGE } from '../../../FluentTester/TestComponents/Separator/consts';
import { BasePage, By } from '../../common/BasePage';

class SeparatorTestPage extends BasePage {
  get _testPage() {
    return By(SEPARATOR_TESTPAGE);
  }

  get _pageName() {
    return SEPARATOR_TESTPAGE;
  }
}

export default new SeparatorTestPage();
