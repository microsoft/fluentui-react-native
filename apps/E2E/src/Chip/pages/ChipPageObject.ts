import { BasePage, By } from '../../common/BasePage';
import { CHIP_TESTPAGE, CHIP_TEST_COMPONENT, CHIP_TEXT, HOMEPAGE_CHIP_BUTTON } from '../consts';

class ChipPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageButtonName() {
    return HOMEPAGE_CHIP_BUTTON;
  }

  get _pageName() {
    return CHIP_TESTPAGE;
  }

  get _primaryComponentName() {
    return CHIP_TEST_COMPONENT;
  }

  get _callbackText() {
    return By(CHIP_TEXT);
  }
}

export default new ChipPageObject();
