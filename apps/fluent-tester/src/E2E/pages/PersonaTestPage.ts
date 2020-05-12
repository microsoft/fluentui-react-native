import { PERSONA_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class PersonaTestPage {
  isPageLoaded(): boolean {
    return this._personaTestPage.isDisplayed();
  }
  get _personaTestPage() {
    return By(PERSONA_TESTPAGE);
  }
}

export default new PersonaTestPage();
