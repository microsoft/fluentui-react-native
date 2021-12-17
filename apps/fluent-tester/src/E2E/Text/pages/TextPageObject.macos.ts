import { TEXT_TESTPAGE, TEXT_TEST_COMPONENT, HOMEPAGE_TEXT_BUTTON } from '../../../FluentTester/TestComponents/Text/consts';
import { BasePage, By } from '../../common/BasePage.macos';

class TextPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(TEXT_TESTPAGE);
  }

  get _pageName() {
    return TEXT_TESTPAGE;
  }

  get _primaryComponent() {
    return By(TEXT_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextPageObject();
