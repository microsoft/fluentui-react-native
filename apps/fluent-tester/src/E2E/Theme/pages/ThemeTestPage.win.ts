import { THEME_TESTPAGE, HOMEPAGE_THEME_BUTTON } from '../../../FluentTester/TestComponents/Theme/consts';
import { BasePage, By } from '../../common/BasePage';

class ThemeTestPage extends BasePage {
  get _testPage() {
    return By(THEME_TESTPAGE);
  }

  get _pageName() {
    return THEME_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_THEME_BUTTON);
  }
}

export default new ThemeTestPage();
