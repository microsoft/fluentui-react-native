import { RADIOGROUP_TESTPAGE } from '../../../RNTester/TestComponents/RadioGroup/consts';
import { BasePage, By } from '../../common/BasePage';

class RadioGroupPage extends BasePage {
  get _testPage() {
    return By(RADIOGROUP_TESTPAGE);
  }

  get _pageName() {
    return RADIOGROUP_TESTPAGE;
  }
}

export default new RadioGroupPage();
