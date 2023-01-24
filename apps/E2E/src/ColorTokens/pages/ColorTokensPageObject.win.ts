import { HOMEPAGE_COLORTOKEN_BUTTON, COLORTOKEN_TESTPAGE } from '../consts';
import { BasePage } from '../../common/BasePage';

class ColorTokenPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/

  get _pageName() {
    return COLORTOKEN_TESTPAGE;
  }

  get _pageButtonName() {
    return HOMEPAGE_COLORTOKEN_BUTTON;
  }
}

export default new ColorTokenPageObject();
