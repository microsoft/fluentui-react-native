import { PERSONA_TESTPAGE, PERSONA_TEST_COMPONENT, HOMEPAGE_PERSONA_BUTTON } from '../../../TestComponents/Persona/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class PersonaPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(PERSONA_TESTPAGE);
  }

  get _pageName() {
    return PERSONA_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(PERSONA_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_PERSONA_BUTTON);
  }
}

export default new PersonaPageObject();
