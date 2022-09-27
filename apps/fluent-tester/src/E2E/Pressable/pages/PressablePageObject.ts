import { PRESSABLE_TESTPAGE, PRESSABLE_TEST_COMPONENT, HOMEPAGE_PRESSABLE_BUTTON } from '../../../TestComponents/Pressable/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class PressablePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(PRESSABLE_TESTPAGE);
  }

  get _pageName() {
    return PRESSABLE_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(PRESSABLE_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_PRESSABLE_BUTTON);
  }
}

export default new PressablePageObject();
