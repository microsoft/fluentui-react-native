import { PERSONA_TESTPAGE, PERSONA_TEST_COMPONENT, HOMEPAGE_PERSONA_BUTTON } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return PERSONA_TESTPAGE;
  }

  get _primaryComponent() {
    return By(PERSONA_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_PERSONA_BUTTON;
  }
}

export default new PersonaPageObject();
