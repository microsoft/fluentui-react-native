import * as React from 'react';
import { Text, View, Alert } from 'react-native';
import { Button } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { ContextualMenu, ContextualMenuItem } from '@fluentui-react-native/contextual-menu';
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

  const onItemClick1 = () => {
    console.log('Item Click', 'This is meuuItem\'s onClick event')
  }

  const onItemClick2 = (key: string) => {
    console.log('Menu Click', 'Menu item ' + key + ' was clicked.');
  }
  return (
    <View>
      <Text style={fabricTesterStyles.testSection} testID={CONTEXTUALMENU_TESTPAGE}>
        ContextualMenu Test
      </Text>
      <Separator />
      <Text>
        Menu Item Click Handled by Menu
      </Text>
      <Separator />
      <Button content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onMenuShow}
          accessibilityLabel="Standard ContextualMenu"
          onItemClick={onItemClick2}
          setShowMenu={setShowContextualMenu}
        >
          <ContextualMenuItem text="MenuItem 1" itemKey="1" onClick={onItemClick1} accessibilityLabel="First Menu Item" />
          <ContextualMenuItem text="MenuItem 2" itemKey="2" />
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
          <ContextualMenuItem text="MenuItem 4" itemKey="4" />
          <ContextualMenuItem text="MenuItem 5" itemKey="5" onClick={onItemClick1} />
        </ContextualMenu>
      )}
      <Text>
        Menu Item Click Handled by each Item
      </Text>
      <Separator />
    </View>
  );
};

/* Test 1: onClick handled by each item
** Text 2: onClick handled by Menu
*/
