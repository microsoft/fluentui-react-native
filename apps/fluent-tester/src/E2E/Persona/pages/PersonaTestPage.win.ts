import { PERSONA_TESTPAGE } from '../../../RNTester/TestComponents/Persona/consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaTestPage extends BasePage {
  get _testPage() {
    return By(PERSONA_TESTPAGE);
  }
}

export default new PersonaTestPage();
