import { BasePage } from '../../common/BasePage';
import { FOCUSTRAPZONE_TESTPAGE, FOCUSTRAPZONE_TEST_COMPONENT, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../consts';

class FocusTrapZonePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return FOCUSTRAPZONE_TESTPAGE;
  }

  get _primaryComponentName() {
    return FOCUSTRAPZONE_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_FOCUSTRAPZONE_BUTTON;
  }
}

export default new FocusTrapZonePageObject();
