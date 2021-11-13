import {
  EXPERIMENTAL_TABS_TESTPAGE,
  HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
} from '../../../FluentTester/TestComponents/TabsExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalTabsTestPage extends BasePage {
  get _testPage() {
    return By(EXPERIMENTAL_TABS_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_TABS_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_TABS_BUTTON);
  }
}

export default new ExperimentalTabsTestPage();
