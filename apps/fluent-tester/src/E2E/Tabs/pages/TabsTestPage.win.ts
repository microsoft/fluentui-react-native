import { TABS_TESTPAGE, HOMEPAGE_TABS_BUTTON } from '../../../FluentTester/TestComponents/Tabs/consts';
import { BasePage, By } from '../../common/BasePage';

class TabsTestPage extends BasePage {
  get _testPage() {
    return By(TABS_TESTPAGE);
  }

  get _pageName() {
    return TABS_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_TABS_BUTTON);
  }
}

export default new TabsTestPage();
