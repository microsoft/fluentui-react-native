import { FOCUSTRAPZONE_TESTPAGE, FOCUSTRAPZONE_TEST_COMPONENT, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class FocusTrapZonePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return FOCUSTRAPZONE_TESTPAGE;
  }

  get _primaryComponent() {
    return By(FOCUSTRAPZONE_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_FOCUSTRAPZONE_BUTTON;
  }
}

export default new FocusTrapZonePageObject();
