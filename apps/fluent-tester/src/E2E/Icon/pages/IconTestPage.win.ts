import { ICON_TESTPAGE } from '../../../FluentTester/TestComponents/Icon/consts';
import { BasePage, By } from '../../common/BasePage';

class IconTestPage extends BasePage {
  get _testPage() {
    return By(ICON_TESTPAGE);
  }

  get _pageName() {
    return ICON_TESTPAGE;
  }
}

export default new IconTestPage();
