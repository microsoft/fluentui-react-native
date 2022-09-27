import {
  FOCUSTRAPZONE_TESTPAGE,
  FOCUSTRAPZONE_TEST_COMPONENT,
  HOMEPAGE_FOCUSTRAPZONE_BUTTON,
} from '../../../TestComponents/FocusTrapZone/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class FocusTrapZonePageObject extends BasePage {
  // OVERRIDE: We use isExisting() here instead of isDisplayed() because FocusTrapZone does not have any UI to it, it's simply
  // a wrapper that adds keyboard focus functionality
  async waitForPrimaryElementDisplayed(timeout?: number): Promise<void> {
    const errorMsg = 'The FocusTrapZone UI Element did not load correctly. Please see logs.';
    await this.waitForCondition(async () => await (await this._primaryComponent).isExisting(), errorMsg, timeout);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(FOCUSTRAPZONE_TESTPAGE);
  }

  get _pageName() {
    return FOCUSTRAPZONE_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(FOCUSTRAPZONE_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_FOCUSTRAPZONE_BUTTON);
  }
}

export default new FocusTrapZonePageObject();
