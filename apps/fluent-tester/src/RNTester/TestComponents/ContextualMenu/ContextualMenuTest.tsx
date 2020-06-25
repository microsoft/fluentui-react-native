import * as React from 'react';
import { Text, View, Alert } from 'react-native';
import { Button, Separator, ContextualMenu, ContextualMenuItem, Callout } from '@fluentui/react-native';
import { fabricTesterStyles } from '../Common/styles';
import { CONTEXTUALMENU_TESTPAGE } from './consts';

export const ContextualMenuTest: React.FunctionComponent<{}> = () => {
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

  const onMenuItemClick = () => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  return (
    <View>
      <Text style={fabricTesterStyles.testSection} testID={CONTEXTUALMENU_TESTPAGE}>
        ContextualMenu Test
      </Text>
      <Separator />
      <Button content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onMenuShow}
          accessibilityLabel="Standard ContextualMenu"
        >
          <ContextualMenuItem text="ContextualMenuItem 1" key="ContextualMenuItem 1" onClick={onMenuItemClick} />
        </ContextualMenu>
      )}
    </View>
  );
};
