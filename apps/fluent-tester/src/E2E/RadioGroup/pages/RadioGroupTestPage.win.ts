import { RADIOGROUP_TESTPAGE, HOMEPAGE_RADIOGROUP_BUTTON } from '../../../FluentTester/TestComponents/RadioGroup/consts';
import { BasePage, By } from '../../common/BasePage';

class RadioGroupPage extends BasePage {
  get _testPage() {
    return By(RADIOGROUP_TESTPAGE);
  }

  get _pageName() {
    return RADIOGROUP_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_RADIOGROUP_BUTTON);
  }
}

export default new RadioGroupPage();
