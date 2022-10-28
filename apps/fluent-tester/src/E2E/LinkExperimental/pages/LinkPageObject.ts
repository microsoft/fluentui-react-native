import {
  EXPERIMENTAL_LINK_TESTPAGE,
  EXPERIMENTAL_LINK_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_LINK_BUTTON,
  EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT,
} from '../../../TestComponents/LinkExperimental/consts';
import { BasePage, By, ComponentSelector } from '../../common/BasePage';
import { Attribute, Keys } from '../../common/consts';

class ExperimentalLinkPageObject extends BasePage {
  async click(selector: ComponentSelector) {
    await (await this.getComponent(selector)).click();
  }

  async sendKeys(selector: ComponentSelector, keys: Keys[]) {
    await (await this.getComponent(selector)).addValue(keys);
  }

  async getHelpText(selector: ComponentSelector) {
    return await this.getElementAttribute(await this.getComponent(selector), Attribute.HelpText);
  }

  private async getComponent(selector: ComponentSelector) {
    if (selector === ComponentSelector.Primary) {
      return await this._primaryComponent;
    }
    return await this._secondaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_LINK_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_LINK_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_LINK_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_LINK_BUTTON);
  }
}

export default new ExperimentalLinkPageObject();
