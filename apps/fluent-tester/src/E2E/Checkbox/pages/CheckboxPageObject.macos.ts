import {
  CHECKBOX_TESTPAGE,
  CHECKBOX_TEST_COMPONENT,
  CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_CHECKBOX_BUTTON,
} from '../../../TestComponents/Checkbox/consts';
import { BasePage, By } from '../../common/BasePage';

class CheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await this._primaryComponent.isSelected();
  }

  async waitForCheckboxUnchecked(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await !this.isCheckboxChecked(), {
      timeout: timeout ?? this.waitForPageTimeout,
      timeoutMsg: 'The onPress() callback for ' + this._pageName + ' did not fire correctly.',
      interval: 1000,
    });
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
