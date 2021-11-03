import { PERSONA_TESTPAGE, HOMEPAGE_PERSONA_BUTTON } from '../../../FluentTester/TestComponents/Persona/consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaTestPage extends BasePage {
  get _testPage() {
    return By(PERSONA_TESTPAGE);
  }

  get _pageName() {
    return PERSONA_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_PERSONA_BUTTON);
  }
}

export default new PersonaTestPage();
