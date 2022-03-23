import { PRESSABLE_TESTPAGE, PRESSABLE_TEST_COMPONENT, HOMEPAGE_PRESSABLE_BUTTON } from '../../../TestComponents/Pressable/consts';
import { BasePage, By } from '../../common/BasePage.macos';

class PressablePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(PRESSABLE_TESTPAGE);
  }

  get _pageName() {
    return PRESSABLE_TESTPAGE;
  }

  get _primaryComponent() {
    return By(PRESSABLE_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_PRESSABLE_BUTTON);
  }
}

export default new PressablePageObject();
