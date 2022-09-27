import { SEPARATOR_TESTPAGE, SEPARATOR_TEST_COMPONENT, HOMEPAGE_SEPARATOR_BUTTON } from '../../../TestComponents/Separator/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class SeparatorPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(SEPARATOR_TESTPAGE);
  }

  get _pageName() {
    return SEPARATOR_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(SEPARATOR_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_SEPARATOR_BUTTON);
  }
}

export default new SeparatorPageObject();
