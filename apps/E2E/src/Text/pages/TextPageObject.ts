import {
  TEXT_TESTPAGE,
  FIRST_TEXT_COMPONENT,
  HOMEPAGE_TEXT_BUTTON,
  SECOND_TEXT_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/Text/consts';
import { BasePage, By } from '../../common/BasePage';

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

  get _secondaryComponent() {
    return By(SECOND_TEXT_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextPageObject();
