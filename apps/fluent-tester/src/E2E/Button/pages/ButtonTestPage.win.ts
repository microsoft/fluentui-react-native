import { BUTTON_TESTPAGE, HOMEPAGE_BUTTON_BUTTON } from '../../../FluentTester/TestComponents/Button/consts';
import { BasePage, By } from '../../common/BasePage';

class ButtonTestPage extends BasePage {
  get _testPage() {
    return By(BUTTON_TESTPAGE);
  }

  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }
}

export default new ButtonTestPage();
