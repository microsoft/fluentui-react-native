import { FOCUSZONE_TESTPAGE, FOCUSZONE_TEST_COMPONENT, HOMEPAGE_FOCUSZONE_BUTTON } from '../../../TestComponents/FocusZone/consts';
import { BasePage, By } from '../../common/BasePage.win';

class FocusZonePageObject extends BasePage {
  // OVERRIDE: We use isExisting() here instead of isDisplayed() because FocusZone does not have any UI to it, it's simply
  // a wrapper that adds keyboard focus functionality
  waitForPrimaryElementDisplayed(timeout?: number): void {
    const errorMsg = 'The FocusZone UI Element did not load correctly. Please see logs.';
    this.waitForCondition(() => this._primaryComponent.isExisting(), errorMsg, timeout);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(FOCUSZONE_TESTPAGE);
  }

  get _pageName() {
    return FOCUSZONE_TESTPAGE;
  }

  get _primaryComponent() {
    return By(FOCUSZONE_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_FOCUSZONE_BUTTON);
  }
}

export default new FocusZonePageObject();
