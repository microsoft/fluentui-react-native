import * as React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem } from '@fluentui-react-native/contextual-menu';
import { CONTEXTUALMENU_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const contextualMenu: React.FunctionComponent<{}> = () => {

  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [isContextualMenuVisible, setIsContextualMenuVisible] = React.useState(false);

  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const toggleShowContextualMenu = React.useCallback(() => {
    setShowContextualMenu(!showContextualMenu);
    setIsContextualMenuVisible(false);
  }, [showContextualMenu, setShowContextualMenu, setIsContextualMenuVisible]);

  const onShowContextualMenu = React.useCallback(() => {
    setIsContextualMenuVisible(true);
  }, [setIsContextualMenuVisible]);

  const onDismissContextualMenu = React.useCallback(() => {
    setShowContextualMenu(false);
    setIsContextualMenuVisible(false);
  }, [setShowContextualMenu]);

  const onItemClick = React.useCallback((key) => {
    setLastMenuItemClicked(key);
  }, [setLastMenuItemClicked]);

  return (
    <View>
      <View style={{ flexDirection: 'column', paddingVertical: 5 }}>
        <Text>
          <Text>Menu Visibility: </Text>
          {isContextualMenuVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
        </Text>
        <Text>
          <Text>Last Menu Item Clicked: </Text>
          {lastMenuItemClicked > 0 ? <Text style={{ color: 'blue' }}>{lastMenuItemClicked}</Text> : <Text style={{ color: 'blue' }}>none</Text>}
        </Text>
        <Button content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
      </View>
      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onShowContextualMenu}
          accessibilityLabel="Standard ContextualMenu"
          onItemClick={onItemClick}
          setShowMenu={setShowContextualMenu}
        >
          <ContextualMenuItem text="MenuItem 1" itemKey="1" accessibilityLabel="First Menu Item" />
          <ContextualMenuItem text="MenuItem 2" itemKey="2" />
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
          <ContextualMenuItem text="MenuItem 4" itemKey="4" />
          <ContextualMenuItem text="MenuItem 5" itemKey="5" />
        </ContextualMenu>
      )}
    </View>
  );
}

const contextualMenuSections: TestSection[] = [
  {
    name: 'Standard ContextualMenu',
    testID: CONTEXTUALMENU_TESTPAGE,
    component: contextualMenu
  },
];

export const ContextualMenuTest: React.FunctionComponent<{}> = () => {

  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog'
  }

  const description = 'ContextualMenus are lists of commands that are based on the context of selection, mouse hover or keyboard focus. They are one of the most effective and highly used command surfaces, and can be used in a variety of places.\n\nThere are variants that originate from a command bar, or from cursor or focus. Those that come from CommandBars use a beak that is horizontally centered on the button. Ones that come from right click and menu button do not have a beak, but appear to the right and below the cursor. ContextualMenus can have submenus from commands, show selection checks, and icons.\n\nOrganize commands in groups divided by rules. This helps users remember command locations, or find less used commands based on proximity to others. One should also group sets of mutually exclusive or multiple selectable options. Use icons sparingly, for high value commands, and don’t mix icons with selection checks, as it makes parsing commands difficult. Avoid submenus of submenus as they can be difficult to invoke or remember.'

  return (
    <Test name="Checkbox Test" description={description} sections={contextualMenuSections} status={status}></Test>
  );
};
