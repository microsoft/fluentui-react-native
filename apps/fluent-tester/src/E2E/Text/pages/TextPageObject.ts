import { TEXT_TESTPAGE, FIRST_TEXT_COMPONENT, HOMEPAGE_TEXT_BUTTON, SECOND_TEXT_COMPONENT } from '../../../TestComponents/Text/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class TextPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(TEXT_TESTPAGE);
  }

  get _pageName() {
    return TEXT_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(FIRST_TEXT_COMPONENT);
  }

  get _secondaryComponent() {
    return GetElement(SECOND_TEXT_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextPageObject();
