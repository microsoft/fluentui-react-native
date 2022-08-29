import * as React from 'react';
import { Text, View } from 'react-native';
import { Separator } from '@fluentui/react-native';
import { menuItems, testImage, iconProps } from './testData';
import { viewWrapperStyle, columnStyle, textColor } from './MenuButtonTestStyles';
import { MenuButton } from '@fluentui-react-native/experimental-menu-button';
import { Switch } from '@fluentui-react-native/switch';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

export const NestedMenuButton: React.FunctionComponent = () => {
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = (_e: InteractionEvent, value: boolean) => {
    setShouldFocusOnMount(value);
  };

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = (_e: InteractionEvent, value: boolean) => {
    setShouldFocusOnContainer(value);
  };

  const onItemClick = React.useCallback(
    (key) => {
      setLastMenuItemClicked(key);
    },
    [setLastMenuItemClicked],
  );

  const [showSubmenu, setShowSubmenu] = React.useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = React.useState(false);
  const [lastSubmenuItemClicked, setSubmenuLastItemClicked] = React.useState(null);

  const toggleShowSubmenu = React.useCallback(() => {
    setShowSubmenu(!showSubmenu);
    setIsSubmenuVisible(!isSubmenuVisible);
  }, [showSubmenu, isSubmenuVisible, setShowSubmenu, setIsSubmenuVisible]);

  const onShowSubmenu = React.useCallback(() => {
    setIsSubmenuVisible(true);
  }, [setIsSubmenuVisible]);

  const onDismissSubmenu = React.useCallback(() => {
    setShowSubmenu(false);
  }, [setShowSubmenu]);

  const onSubmenuItemClick = React.useCallback(
    (key) => {
      setSubmenuLastItemClicked(key);
    },
    [setSubmenuLastItemClicked],
  );

  const nestedMenuItems = [
    ...menuItems,
    {
      hasSubmenu: true,
      itemKey: '4',
      text: 'SubmenuItem svg icon',
      componentRef: React.useRef(null),
      icon: iconProps,
      onHoverIn: toggleShowSubmenu,
      showSubmenu,
      submenuProps: {
        onShow: onShowSubmenu,
        setShowMenu: toggleShowSubmenu,
        onDismiss: onDismissSubmenu,
        onItemClick: onSubmenuItemClick,
      },
      submenuItems: [
        {
          icon: iconProps,
          text: 'SubmenuItem svg icon',
          itemKey: '1',
        },
        {
          itemKey: '2',
          text: 'SubmenuItem 2',
          disabled: true,
        },
        {
          itemKey: '3',
          text: 'SubmenuItem 3',
        },
      ],
    },
    {
      itemKey: '5',
      text: 'Menu Item',
    },
    {
      hasSubmenu: true,
      itemKey: '6',
      text: 'SubmenuItem',
      componentRef: React.useRef(null),
      submenuProps: {
        onItemClick: onSubmenuItemClick,
      },
      submenuItems: [
        {
          text: 'SubmenuItem 1',
          itemKey: '1',
        },
        {
          itemKey: '2',
          text: 'SubmenuItem 2',
        },
        {
          itemKey: '3',
          text: 'SubmenuItem 3',
        },
      ],
    },
  ];

  const rasterImageProps = {
    rasterImageSource: {
      src: testImage,
    },
    width: 12,
    height: 12,
  };

  return (
    <View>
      <View style={viewWrapperStyle}>
        <View style={columnStyle}>
          <Switch checked={focusOnMount} onChange={toggleFocusOnMount} label="Should Focus on Mount" />
          <Switch checked={focusOnContainer} onChange={toggleFocusOnContainer} label="Should Focus on Container" />
        </View>

        <Separator vertical />

        <View style={columnStyle}>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? <Text style={textColor}>{lastMenuItemClicked}</Text> : <Text style={textColor}>none</Text>}
          </Text>
          <Text>
            <Text>Last Submenu Item Clicked: </Text>
            {lastSubmenuItemClicked > 0 ? <Text style={textColor}>{lastSubmenuItemClicked}</Text> : <Text style={textColor}>none</Text>}
          </Text>
          <MenuButton content="Press for Nested MenuButton" icon={rasterImageProps} menuItems={nestedMenuItems} onItemClick={onItemClick} />
        </View>
      </View>
    </View>
  );
};
