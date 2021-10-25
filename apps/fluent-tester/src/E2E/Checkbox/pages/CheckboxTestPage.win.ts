import { CHECKBOX_TESTPAGE, HOMEPAGE_CHECKBOX_BUTTON } from '../../../FluentTester/TestComponents/Checkbox/consts';
import { BasePage, By } from '../../common/BasePage';

class CheckboxTestPage extends BasePage {
  get _testPage() {
    return By(CHECKBOX_TESTPAGE);
  }

  get _pageName() {
    return CHECKBOX_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_CHECKBOX_BUTTON);
  }
}

export default new CheckboxTestPage();
