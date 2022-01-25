import {
  RADIOGROUP_TESTPAGE,
  RADIOGROUP_TEST_COMPONENT,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_RADIOGROUP_BUTTON,
} from '../../../FluentTester/TestComponents/RadioGroup/consts';
import { BasePage, By } from '../../common/BasePage.macos';

export const enum RadioButtonSelector {
  Primary = 0, // this._primaryComponent
  Secondary, // this._secondaryComponent
}

class RadioGroupPage extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(RADIOGROUP_TESTPAGE);
  }

  get _pageName() {
    return RADIOGROUP_TESTPAGE;
  }

  get _primaryComponent() {
    return By(RADIOGROUP_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(RADIOGROUP_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_RADIOGROUP_BUTTON);
  }
}

export default new RadioGroupPage();
