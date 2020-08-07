import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem } from '@fluentui-react-native/contextual-menu';
import { CONTEXTUALMENU_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const contextualMenu: React.FunctionComponent<{}> = () => {

  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);

  const toggleShowContextualMenu = React.useCallback(() => {
    setShowContextualMenu(!showContextualMenu);
  }, [showContextualMenu, setShowContextualMenu]);

  const onDismissContextualMenu = React.useCallback(() => {
    setShowContextualMenu(false);
  }, [setShowContextualMenu]);

  const onMenuShow = () => {
    console.log('ContextualMenu shown');
  };

  return (
    <View>
      <Button content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onMenuShow}
          accessibilityLabel="Standard ContextualMenu"
        >
          <ContextualMenuItem text="ContextualMenuItem 1" key="ContextualMenuItem 1" onClick={onMenuShow} accessibilityLabel="First Menu Item" />
          <ContextualMenuItem text="ContextualMenuItem 2" key="ContextualMenuItem 2" onClick={onMenuShow} />
          <ContextualMenuItem text="ContextualMenuItem 3" key="ContextualMenuItem 3" onClick={onMenuShow} />
        </ContextualMenu>
      )}
    </View>
  );
}

const contextualMenuSections: TestSection[] = [
  {
    name: 'Contextual Menu',
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
