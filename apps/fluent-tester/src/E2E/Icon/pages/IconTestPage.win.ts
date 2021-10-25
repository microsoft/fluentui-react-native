import { ICON_TESTPAGE, HOMEPAGE_ICON_BUTTON } from '../../../FluentTester/TestComponents/Icon/consts';
import { BasePage, By } from '../../common/BasePage';

class IconTestPage extends BasePage {
  get _testPage() {
    return By(ICON_TESTPAGE);
  }

  get _pageName() {
    return ICON_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_ICON_BUTTON);
  }
}

export default new IconTestPage();
