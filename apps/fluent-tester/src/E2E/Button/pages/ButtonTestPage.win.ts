import { BUTTON_TESTPAGE } from '../../../FluentTester/TestComponents/Button/consts';
import { BasePage, By } from '../../common/BasePage';

class ButtonTestPage extends BasePage {
  get _testPage() {
    return By(BUTTON_TESTPAGE);
  }

  get _pageName() {
    return BUTTON_TESTPAGE;
  }
}

export default new ButtonTestPage();
