import { TEXT_TESTPAGE, FIRST_TEXT_COMPONENT, HOMEPAGE_TEXT_BUTTON } from '../../../TestComponents/Text/consts';
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
    return By(FIRST_TEXT_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextPageObject();
