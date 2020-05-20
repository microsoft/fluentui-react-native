import { PERSONA_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class PersonaTestPage extends BasePage {
  get _testPage() {
    return By(PERSONA_TESTPAGE);
  }
}

export default new PersonaTestPage();
