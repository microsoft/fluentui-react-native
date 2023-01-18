import { FocusZoneDirection } from '@fluentui-react-native/focus-zone';
import {
  FOCUSZONE_CIRCLE_NAV_SWITCH,
  FOCUSZONE_DEFAULT_TABBABLE_SWITCH,
  FOCUSZONE_DIRECTION_ID,
  FOCUSZONE_DIRECTION_PICKER,
  FOCUSZONE_DISABLED_SWITCH,
  FOCUSZONE_GRID_AFTER,
  FOCUSZONE_GRID_BEFORE,
  FOCUSZONE_GRID_BUTTON,
  FOCUSZONE_TESTPAGE,
  FOCUSZONE_TEST_COMPONENT,
  FOCUSZONE_TWO_DIM_SWITCH,
  HOMEPAGE_FOCUSZONE_BUTTON,
} from '../consts';
import { BasePage, By } from '../../common/BasePage';

export const enum GridButton {
  One = 1,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
}

export const enum GridFocusZoneOption {
  SetDirection = 0,
  Set2DNavigation,
  SetCircularNavigation,
  UseDefaultTabbableElement,
  Disable,
}

type BooleanGridFocusZoneOption =
  | GridFocusZoneOption.UseDefaultTabbableElement
  | GridFocusZoneOption.Set2DNavigation
  | GridFocusZoneOption.SetCircularNavigation
  | GridFocusZoneOption.Disable;

class FocusZonePageObject extends BasePage {
  async resetTest() {
    await this.configureGridFocusZone(GridFocusZoneOption.SetDirection, 'bidirectional');
    await this.configureGridFocusZone(GridFocusZoneOption.Set2DNavigation, false);
    await this.configureGridFocusZone(GridFocusZoneOption.SetCircularNavigation, false);
    await this.configureGridFocusZone(GridFocusZoneOption.Disable, false);
  }

  async configureGridFocusZone(option: GridFocusZoneOption.SetDirection, direction: FocusZoneDirection);
  async configureGridFocusZone(option: BooleanGridFocusZoneOption, value: boolean);
  async configureGridFocusZone(option: GridFocusZoneOption, arg: any): Promise<void> {
    let switchElement: WebdriverIO.Element;
    switch (option) {
      case GridFocusZoneOption.SetDirection:
        await (await this._directionPicker).click();
        await browser.waitUntil(async () => await (await this._getGridFocusZoneMenuOption(arg)).isDisplayed());
        await (await this._getGridFocusZoneMenuOption(arg)).click();
        return;
      case GridFocusZoneOption.Set2DNavigation:
        switchElement = await this._twoDimSwitch;
        break;
      case GridFocusZoneOption.SetCircularNavigation:
        switchElement = await this._circleNavSwitch;
        break;
      case GridFocusZoneOption.UseDefaultTabbableElement:
        switchElement = await this._defaultTabbableElementSwitch;
        break;
      case GridFocusZoneOption.Disable:
        switchElement = await this._disabledSwitch;
        break;
      default:
    }
    const switchValue = await switchElement.isSelected();
    if (switchValue !== arg) {
      await switchElement.click();
    }
  }

  async gridButton(button: GridButton) {
    return await By(FOCUSZONE_GRID_BUTTON(button));
  }

  private async _getGridFocusZoneMenuOption(direction: FocusZoneDirection) {
    return await By(FOCUSZONE_DIRECTION_ID(direction));
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return FOCUSZONE_TESTPAGE;
  }

  get _primaryComponent() {
    return By(FOCUSZONE_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_FOCUSZONE_BUTTON;
  }

  get _directionPicker() {
    return By(FOCUSZONE_DIRECTION_PICKER);
  }

  get _twoDimSwitch() {
    return By(FOCUSZONE_TWO_DIM_SWITCH);
  }

  get _disabledSwitch() {
    return By(FOCUSZONE_DISABLED_SWITCH);
  }

  get _circleNavSwitch() {
    return By(FOCUSZONE_CIRCLE_NAV_SWITCH);
  }

  get _defaultTabbableElementSwitch() {
    return By(FOCUSZONE_DEFAULT_TABBABLE_SWITCH);
  }

  get _beforeButton() {
    return By(FOCUSZONE_GRID_BEFORE);
  }

  get _afterButton() {
    return By(FOCUSZONE_GRID_AFTER);
  }
}

export default new FocusZonePageObject();
