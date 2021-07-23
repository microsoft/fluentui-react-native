/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { Text, View, Switch } from 'react-native';
import { Separator, MenuButton, ContextualMenuProps } from '@fluentui/react-native';
import { MENU_BUTTON_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from '../Button/test.svg';
import { menuItems, testImage } from './testData';

const menuButton: React.FunctionComponent<{}> = () => {
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

  const onItemClick = React.useCallback(
    (key) => {
      setLastMenuItemClicked(key);
    },
    [setLastMenuItemClicked],
  );

  const contextualMenuProps: ContextualMenuProps = {
    accessibilityLabel: 'MenuButton',
    shouldFocusOnMount: focusOnMount,
    shouldFocusOnContainer: focusOnContainer,
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Mount</Text>
            <Switch value={focusOnMount} onValueChange={toggleFocusOnMount} />
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Container</Text>
            <Switch value={focusOnContainer} onValueChange={toggleFocusOnContainer} />
          </View>
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? (
              <Text style={{ color: 'blue' }}>{lastMenuItemClicked}</Text>
            ) : (
              <Text style={{ color: 'blue' }}>none</Text>
            )}
          </Text>
          <MenuButton content="Standard MenuButton" menuItems={menuItems} onItemClick={onItemClick} contextualMenu={contextualMenuProps} />
          <Text>Disabled MenuButton</Text>
          <MenuButton disabled content="Disabled MenuButton" menuItems={menuItems} />
        </View>
      </View>
    </View>
  );
};

const nestedMenuButton: React.FunctionComponent<{}> = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

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
      icon: { svgSource: svgProps, width: 20, height: 20 },
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
          icon: { svgSource: svgProps, width: 20, height: 20 },
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

  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Mount</Text>
            <Switch value={focusOnMount} onValueChange={toggleFocusOnMount} />
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Container</Text>
            <Switch value={focusOnContainer} onValueChange={toggleFocusOnContainer} />
          </View>
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Text>
            <Text>Last Menu Item Clicked: </Text>
            {lastMenuItemClicked > 0 ? (
              <Text style={{ color: 'blue' }}>{lastMenuItemClicked}</Text>
            ) : (
              <Text style={{ color: 'blue' }}>none</Text>
            )}
          </Text>
          <Text>
            <Text>Last Submenu Item Clicked: </Text>
            {lastSubmenuItemClicked > 0 ? (
              <Text style={{ color: 'blue' }}>{lastSubmenuItemClicked}</Text>
            ) : (
              <Text style={{ color: 'blue' }}>none</Text>
            )}
          </Text>
          <MenuButton icon={testImage} content="Press for Nested MenuButton" menuItems={nestedMenuItems} onItemClick={onItemClick} />
        </View>
      </View>
    </View>
  );
};

const customizedUIMenuButton: React.FunctionComponent<{}> = () => {
  const StyledMenuButton = MenuButton.customize({
    button: {
      borderRadius: 4,
      backgroundColor: '#0095ff',
      borderWidth: 0,
      color: '#fff',
      variant: 'heroSemibold',
      fontFamily: 'Georgia',
    },
    contextualMenu: { backgroundColor: '#a9dbff' },
  });
  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>MenuButton with customized UI</Text>
          </View>
        </View>
      </View>
      <StyledMenuButton content="styled MenuButton" menuItems={menuItems} />
    </View>
  );
};

const menuButtonSections: TestSection[] = [
  {
    name: 'Standard MenuButton',
    testID: MENU_BUTTON_TESTPAGE,
    component: menuButton,
  },
  {
    name: 'Nested MenuButton',
    component: nestedMenuButton,
  },
  {
    name: 'MenuButton with customized UI',
    component: customizedUIMenuButton,
  },
];

export const MenuButtonTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'MenuButton is a component which contains ContextualMenu and Button components. This control combines and simplifies the API for customers.\nClicking on MenuButton opens ContextualMenu. It can have Submenu. But selection checks and a beak are not implemented.';

  return <Test name="MenuButton Test" description={description} sections={menuButtonSections} status={status}></Test>;
};
