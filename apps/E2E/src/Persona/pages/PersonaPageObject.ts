import { PERSONA_TESTPAGE, PERSONA_TEST_COMPONENT, HOMEPAGE_PERSONA_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(PERSONA_TESTPAGE);
  }

  get _pageName() {
    return PERSONA_TESTPAGE;
  }

  get _primaryComponentName() {
    return PERSONA_TEST_COMPONENT;
  }

  get _pageButton() {
    return By(HOMEPAGE_PERSONA_BUTTON);
  }
}

export default new PersonaPageObject();
