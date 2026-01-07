import { BasePage, By } from '../../common/BasePage';
import {
  Drawer_TESTPAGE,
  Drawer_TEST_COMPONENT,
  HOMEPAGE_Drawer_BUTTON,
  Drawer_TEXT,
  Drawer_TEST_COMPONENT_DISMISS_BUTTON,
} from '../consts';

class DrawerPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return Drawer_TESTPAGE;
  }

  get _primaryComponentName() {
    return Drawer_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_Drawer_BUTTON;
  }

  get _accessoryButton(): ChainablePromiseElement {
    return By(Drawer_TEST_COMPONENT_DISMISS_BUTTON);
  }

  get _callbackText(): ChainablePromiseElement {
    return By(Drawer_TEXT);
  }
}

export default new DrawerPageObject();
