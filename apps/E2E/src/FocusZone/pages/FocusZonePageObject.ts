import type { FocusZoneDirection } from '@fluentui-react-native/focus-zone';

import { BasePage, By } from '../../common/BasePage';
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

export type GridButton = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type GridFocusZoneOption = 'SetDirection' | 'Set2DNavigation' | 'SetCircularNavigation' | 'UseDefaultTabbableElement' | 'Disable';

class FocusZonePageObject extends BasePage {
  async resetTest() {
    await this.configureGridFocusZone('SetDirection', 'bidirectional');
    await this.configureGridFocusZone('Set2DNavigation', false);
    await this.configureGridFocusZone('SetCircularNavigation', false);
    await this.configureGridFocusZone('Disable', false);
  }

  async configureGridFocusZone(option: 'SetDirection', direction: FocusZoneDirection);
  async configureGridFocusZone(option: GridFocusZoneOption, value: boolean);
  async configureGridFocusZone(option: GridFocusZoneOption, arg: any): Promise<void> {
    let switchElement: ChainablePromiseElement;
    switch (option) {
      case 'SetDirection': {
        const DirectionDropdown = this._directionPicker;

        // If the dropdown is already at the default value, break
        if ((await DirectionDropdown.getAttribute('Name')).indexOf(arg) !== -1) {
          return;
        }

        await DirectionDropdown.click();
        await browser.waitUntil(async () => await this._getGridFocusZoneMenuOption(arg).isDisplayed());
        await this._getGridFocusZoneMenuOption(arg).click();

        await browser.waitUntil(async () => (await DirectionDropdown.getAttribute('Name')).indexOf(arg) !== -1, {
          timeout: 15000,
          timeoutMsg: "Could not reset the directional dropdown back to it's original value",
        });
        return;
      }
      case 'Set2DNavigation':
        switchElement = this._twoDimSwitch;
        break;
      case 'SetCircularNavigation':
        switchElement = this._circleNavSwitch;
        break;
      case 'UseDefaultTabbableElement':
        switchElement = this._defaultTabbableElementSwitch;
        break;
      case 'Disable':
        switchElement = this._disabledSwitch;
        break;
      default:
    }
    const switchValue = await switchElement.isSelected();
    if (switchValue !== arg) {
      await switchElement.click();
    }

    // Wait until the switch correctly changes states
    await browser.waitUntil(async () => (await switchElement.isSelected()) == arg, {
      timeout: 15000,
      timeoutMsg: `Attempted to switch the ${option} to ${arg}, but it remained at ${await switchElement.isSelected()}`,
    });
  }

  gridButton(button: GridButton) {
    return By(FOCUSZONE_GRID_BUTTON(button));
  }

  private _getGridFocusZoneMenuOption(direction: FocusZoneDirection) {
    return By(FOCUSZONE_DIRECTION_ID(direction));
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return FOCUSZONE_TESTPAGE;
  }

  get _primaryComponentName() {
    return FOCUSZONE_TEST_COMPONENT;
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
