/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { Text, View } from 'react-native';
import { ButtonV1 as Button, ContextualMenu, ContextualMenuItem, Separator } from '@fluentui/react-native';
import { CONTEXTUALMENUITEM_TEST_COMPONENT, CONTEXTUALMENU_TEST_COMPONENT } from './consts';
import { Switch } from '@fluentui-react-native/switch';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

export const E2EContextualMenuTest: React.FunctionComponent = () => {
  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [isContextualMenuVisible, setIsContextualMenuVisible] = React.useState(false);
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [isBeakVisible, setIsBeakVisible] = React.useState(false);
  const onIsBeakVisibleChange = React.useCallback((_e: InteractionEvent, value) => setIsBeakVisible(value), []);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((_e: InteractionEvent, value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback(
    (_e: InteractionEvent, value) => setShouldFocusOnContainer(value),
    [setShouldFocusOnContainer],
  );

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

  const onItemClick = React.useCallback(
    (key) => {
      setLastMenuItemClicked(key);
    },
    [setLastMenuItemClicked],
  );

  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Switch checked={focusOnMount} onChange={toggleFocusOnMount} label="Should Focus on Mount" />
          <Switch checked={focusOnContainer} onChange={toggleFocusOnContainer} label="Should Focus on Container" />
          <Switch checked={isBeakVisible} onChange={onIsBeakVisibleChange} label="Beak Visible" />
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Text>
            <Text>Menu Visibility: </Text>
            {isContextualMenuVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
          </Text>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? (
              <Text style={{ color: 'blue' }}>{lastMenuItemClicked}</Text>
            ) : (
              <Text style={{ color: 'blue' }}>none</Text>
            )}
          </Text>
          <Button onClick={toggleShowContextualMenu} componentRef={stdBtnRef} testID={CONTEXTUALMENU_TEST_COMPONENT}>
            Press for ContextualMenu
          </Button>
        </View>
      </View>

      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onShowContextualMenu}
          onItemClick={onItemClick}
          setShowMenu={toggleShowContextualMenu}
          shouldFocusOnMount={focusOnMount}
          shouldFocusOnContainer={focusOnContainer}
          isBeakVisible={isBeakVisible}
        >
          <ContextualMenuItem text="MenuItem 1" itemKey="1" testID={CONTEXTUALMENUITEM_TEST_COMPONENT} />
          <ContextualMenuItem text="MenuItem 2" itemKey="2" />
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
          <ContextualMenuItem text="MenuItem 4" itemKey="4" />
          <ContextualMenuItem text="MenuItem 5" itemKey="5" />
        </ContextualMenu>
      )}
    </View>
  );
};
