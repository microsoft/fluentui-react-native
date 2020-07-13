import * as React from 'react';
import { Text, View } from 'react-native';
import { Button, Separator, ContextualMenu, ContextualMenuItem } from '@fluentui/react-native';
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
          <ContextualMenuItem text="ContextualMenuItem 1" key="ContextualMenuItem 1" onClick={onMenuShow} accessibilityLabel="First Menu Item" />
          <ContextualMenuItem text="ContextualMenuItem 2" key="ContextualMenuItem 2" onClick={onMenuShow} />
          <ContextualMenuItem text="ContextualMenuItem 3" key="ContextualMenuItem 3" onClick={onMenuShow} />
        </ContextualMenu>
      )}
    </View>
  );
};
