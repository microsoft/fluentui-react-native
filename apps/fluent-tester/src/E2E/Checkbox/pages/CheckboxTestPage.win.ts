import { CHECKBOX_TESTPAGE } from '../../../RNTester/TestComponents/Checkbox/consts';
import { BasePage, By } from '../../common/BasePage';

class CheckboxTestPage extends BasePage {
  get _testPage() {
    return By(CHECKBOX_TESTPAGE);
  }

  get _pageName() {
    return CHECKBOX_TESTPAGE;
  }
}

export default new CheckboxTestPage();
