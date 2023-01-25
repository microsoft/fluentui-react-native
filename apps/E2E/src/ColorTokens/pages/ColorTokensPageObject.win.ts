import { HOMEPAGE_COLORTOKEN_BUTTON } from '../consts';
import { BasePage } from '../../common/BasePage';

class ColorTokenPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/

  get _pageName() {
    return 'Hi';
  }

  get _pageButtonName() {
    return HOMEPAGE_COLORTOKEN_BUTTON;
  }
}

export default new ColorTokenPageObject();
