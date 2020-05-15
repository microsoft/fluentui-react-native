import { CHECKBOX_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class CheckboxTestPage extends BasePage {
  get _testPage() {
    return By(CHECKBOX_TESTPAGE);
  }
}

export default new CheckboxTestPage();
