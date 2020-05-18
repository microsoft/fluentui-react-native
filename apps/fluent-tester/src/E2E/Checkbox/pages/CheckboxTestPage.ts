import { CHECKBOX_TESTPAGE } from '../../../RNTester/TestComponents/Checkbox/consts';
import { BasePage, By } from '../../pages/BasePage';

class CheckboxTestPage extends BasePage {
  get _testPage() {
    return By(CHECKBOX_TESTPAGE);
  }
}

export default new CheckboxTestPage();
