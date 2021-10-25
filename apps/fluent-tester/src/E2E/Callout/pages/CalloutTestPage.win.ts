import { CALLOUT_TESTPAGE, HOMEPAGE_CALLOUT_BUTTON } from '../../../FluentTester/TestComponents/Callout/consts';
import { BasePage, By } from '../../common/BasePage';

class CalloutTestPage extends BasePage {
  get _testPage() {
    return By(CALLOUT_TESTPAGE);
  }

  get _pageName() {
    return CALLOUT_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_CALLOUT_BUTTON);
  }
}

export default new CalloutTestPage();
