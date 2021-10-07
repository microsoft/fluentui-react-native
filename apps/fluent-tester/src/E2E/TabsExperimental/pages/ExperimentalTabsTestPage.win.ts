import { EXPERIMENTAL_TABS_TESTPAGE } from '../../../FluentTester/TestComponents/TabsExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalTabsTestPage extends BasePage {
  get _testPage() {
    return By(EXPERIMENTAL_TABS_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_TABS_TESTPAGE;
  }
}

export default new ExperimentalTabsTestPage();
