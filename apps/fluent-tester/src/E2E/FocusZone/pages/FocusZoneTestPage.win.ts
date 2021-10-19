import { FOCUSZONE_TESTPAGE, HOMEPAGE_FOCUSZONE_BUTTON } from '../../../FluentTester/TestComponents/FocusZone/consts';
import { BasePage, By } from '../../common/BasePage';

class FocusZoneTestPage extends BasePage {
  get _testPage() {
    return By(FOCUSZONE_TESTPAGE);
  }

  get _pageName() {
    return FOCUSZONE_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_FOCUSZONE_BUTTON);
  }
}

export default new FocusZoneTestPage();
