import { JSAVATAR_TESTPAGE, HOMEPAGE_AVATAR_BUTTON } from '../../../FluentTester/TestComponents/Avatar/consts';
import { BasePage, By } from '../../common/BasePage.win';

class AvatarPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(JSAVATAR_TESTPAGE);
  }

  get _pageButton() {
    return By(HOMEPAGE_AVATAR_BUTTON);
  }
}

export default new AvatarPageObject();
