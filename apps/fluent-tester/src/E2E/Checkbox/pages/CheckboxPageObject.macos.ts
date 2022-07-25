import {
  CHECKBOX_TESTPAGE,
  CHECKBOX_TEST_COMPONENT,
  CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_CHECKBOX_BUTTON,
} from '../../../TestComponents/Checkbox/consts';
import { BasePage, By } from '../../common/BasePage.macos';

class CheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  isCheckboxChecked(): boolean {
    return this._primaryComponent.isSelected();
  }

  waitForCheckboxUnchecked(timeout?: number): void {
    browser.waitUntil(
      () => {
        return !this.isCheckboxChecked();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: 'The onPress() callback for ' + this._pageName + ' did not fire correctly.',
        interval: 1000,
      },
    );
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(CHECKBOX_TESTPAGE);
  }

  get _pageName() {
    return CHECKBOX_TESTPAGE;
  }

  get _primaryComponent() {
    return By(CHECKBOX_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(CHECKBOX_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_CHECKBOX_BUTTON);
  }
}

export default new CheckboxPageObject();
