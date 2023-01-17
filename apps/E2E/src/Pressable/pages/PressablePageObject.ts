import { PRESSABLE_TESTPAGE, PRESSABLE_TEST_COMPONENT, HOMEPAGE_PRESSABLE_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class PressablePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return PRESSABLE_TESTPAGE;
  }

  get _primaryComponent() {
    return By(PRESSABLE_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_PRESSABLE_BUTTON;
  }
}

export default new PressablePageObject();
