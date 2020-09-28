import { FOCUSZONE_TESTPAGE } from '../../../FluentTester/TestComponents/FocusZone/consts';
import { BasePage, By } from '../../common/BasePage';

class FocusZoneTestPage extends BasePage {
  get _testPage() {
    return By(FOCUSZONE_TESTPAGE);
  }

  get _pageName() {
    return FOCUSZONE_TESTPAGE;
  }
}

export default new FocusZoneTestPage();
