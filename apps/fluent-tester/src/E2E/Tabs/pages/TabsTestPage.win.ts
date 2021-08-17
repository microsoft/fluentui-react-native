import { TABS_TESTPAGE } from '../../../FluentTester/TestComponents/Tabs/consts';
import { BasePage, By } from '../../common/BasePage';

class TabsTestPage extends BasePage {
  get _testPage() {
    return By(TABS_TESTPAGE);
  }

  get _pageName() {
    return TABS_TESTPAGE;
  }
}

export default new TabsTestPage();
