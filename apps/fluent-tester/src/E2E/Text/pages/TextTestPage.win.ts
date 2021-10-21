import { TEXT_TESTPAGE, HOMEPAGE_TEXT_BUTTON } from '../../../FluentTester/TestComponents/Text/consts';
import { BasePage, By } from '../../common/BasePage';

class TextTestPage extends BasePage {
  get _testPage() {
    return By(TEXT_TESTPAGE);
  }

  get _pageName() {
    return TEXT_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextTestPage();
