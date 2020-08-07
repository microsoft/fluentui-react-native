import * as React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { ContextualMenu, ContextualMenuItem } from '@fluentui-react-native/contextual-menu';
import { fabricTesterStyles } from '../Common/styles';
import { CONTEXTUALMENU_TESTPAGE } from './consts';

export const ContextualMenuTest: React.FunctionComponent<{}> = () => {
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
      <Text style={fabricTesterStyles.testSection} testID={CONTEXTUALMENU_TESTPAGE}>
        Standard ContextualMenu
      </Text>
      <Separator />
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
};
