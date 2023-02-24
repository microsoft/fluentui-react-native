import { BasePage } from '../../common/BasePage';
import { PRESSABLE_TESTPAGE, PRESSABLE_TEST_COMPONENT, HOMEPAGE_PRESSABLE_BUTTON } from '../consts';

class PressablePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return PRESSABLE_TESTPAGE;
  }

  get _primaryComponentName() {
    return PRESSABLE_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_PRESSABLE_BUTTON;
  }
}

export default new PressablePageObject();
