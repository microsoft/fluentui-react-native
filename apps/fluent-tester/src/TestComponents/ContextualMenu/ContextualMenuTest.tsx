import * as React from 'react';
import { Text, View, Switch } from 'react-native';

import { Text as FURNText, ContextualMenu, ContextualMenuItem, Submenu, SubmenuItem, Separator, Checkbox } from '@fluentui/react-native';
import { CONTEXTUALMENU_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { MenuButton } from '@fluentui-react-native/experimental-menu-button';

import { E2EContextualMenuTest } from './E2EContextualMenuTest';
import { svgProps, fontProps, testImage } from '../Common/iconExamples';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const ContextualMenuMainTest: React.FunctionComponent = () => {
  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [isContextualMenuVisible, setIsContextualMenuVisible] = React.useState(false);
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [isBeakVisible, setIsBeakVisible] = React.useState(false);
  const onIsBeakVisibleChange = React.useCallback((value) => setIsBeakVisible(value), []);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

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
          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Mount</Text>
            <Switch value={focusOnMount} onValueChange={toggleFocusOnMount} />
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Text>Should Focus on Container</Text>
            <Switch value={focusOnContainer} onValueChange={toggleFocusOnContainer} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text>Beak Visible</Text>
            <Switch value={isBeakVisible} onValueChange={onIsBeakVisibleChange} />
          </View>
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
          <MenuButton content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
        </View>
      </View>

      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onShowContextualMenu}
          accessibilityLabel="Standard ContextualMenu"
          onItemClick={onItemClick}
          setShowMenu={toggleShowContextualMenu}
          shouldFocusOnMount={focusOnMount}
          shouldFocusOnContainer={focusOnContainer}
          isBeakVisible={isBeakVisible}
        >
          <ContextualMenuItem text="MenuItem 1" itemKey="1" />
          <ContextualMenuItem text="MenuItem 2" itemKey="2" />
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
          <ContextualMenuItem text="MenuItem 4" itemKey="4" />
          <ContextualMenuItem text="MenuItem 5" itemKey="5" />
        </ContextualMenu>
      )}
    </View>
  );
};

const NestedContextualMenu: React.FunctionComponent = () => {
  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [isContextualMenuVisible, setIsContextualMenuVisible] = React.useState(false);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

  const toggleShowContextualMenu = React.useCallback(() => {
    setShowContextualMenu(!showContextualMenu);
    setIsContextualMenuVisible(!isContextualMenuVisible);
  }, [showContextualMenu, isContextualMenuVisible, setShowContextualMenu, setIsContextualMenuVisible]);

  const onShowContextualMenu = React.useCallback(() => {
    setIsContextualMenuVisible(true);
  }, [setIsContextualMenuVisible]);

  const onDismissContextualMenu = React.useCallback(() => {
    setShowContextualMenu(false);
    setIsContextualMenuVisible(false);
  }, [setShowContextualMenu]);

  const stdMenuItemRef = React.useRef(null);

  const [showSubmenu, setShowSubmenu] = React.useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = React.useState(false);

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

  const onClick = React.useCallback(() => {
    console.log('submenu item clicked');
  }, []);

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
            <Text>Menu Visibility: </Text>
            {isContextualMenuVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
          </Text>

          <Text>
            <Text>Submenu Visibility: </Text>
            {isSubmenuVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
          </Text>
          <MenuButton content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
        </View>
      </View>

      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onShowContextualMenu}
          accessibilityLabel="Standard ContextualMenu"
          setShowMenu={toggleShowContextualMenu}
          shouldFocusOnMount={focusOnMount}
          shouldFocusOnContainer={focusOnContainer}
        >
          <ContextualMenuItem icon={testImage} text="Menu item with png Icon" itemKey="1" />
          <ContextualMenuItem icon={{ fontSource: fontProps, color: 'blue' }} text="Menu item with font icon" itemKey="2" />
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
          <SubmenuItem
            icon={{ svgSource: svgProps, width: 12, height: 12 }}
            text="Nested Menu"
            itemKey="4"
            onHoverIn={toggleShowSubmenu}
            componentRef={stdMenuItemRef}
            expanded={showSubmenu}
          />
          {showSubmenu && (
            <Submenu target={stdMenuItemRef} onDismiss={onDismissSubmenu} onShow={onShowSubmenu} setShowMenu={toggleShowSubmenu}>
              <ContextualMenuItem
                icon={{ svgSource: svgProps, width: 12, height: 12 }}
                text="SubmenuItem svg icon"
                itemKey="4"
                onClick={onClick}
              />
              <ContextualMenuItem text="SubmenuItem 2" itemKey="2" />
              <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
            </Submenu>
          )}
          <ContextualMenuItem text="Menuitem 5" itemKey="5" />
        </ContextualMenu>
      )}
    </View>
  );
};

// custom text
const IndigoHeroBold = FURNText.customize({ tokens: { variant: 'heroStandard', fontWeight: '100', color: '#4b0082' } });

const IconContextualMenu: React.FunctionComponent = () => {
  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [isContextualMenuVisible, setIsContextualMenuVisible] = React.useState(false);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

  const toggleShowContextualMenu = React.useCallback(() => {
    setShowContextualMenu(!showContextualMenu);
    setIsContextualMenuVisible(!isContextualMenuVisible);
  }, [showContextualMenu, isContextualMenuVisible, setShowContextualMenu, setIsContextualMenuVisible]);

  const onShowContextualMenu = React.useCallback(() => {
    setIsContextualMenuVisible(true);
  }, [setIsContextualMenuVisible]);

  const onDismissContextualMenu = React.useCallback(() => {
    setShowContextualMenu(false);
    setIsContextualMenuVisible(false);
  }, [setShowContextualMenu]);

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
            <Text>Menu Visibility: </Text>
            {isContextualMenuVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
          </Text>
          <MenuButton
            componentRef={stdBtnRef}
            icon={{ svgSource: svgProps, height: 12, width: 12 }}
            onClick={toggleShowContextualMenu}
            accessibilityLabel="Wheelchair icon button"
            tooltip="Toggles the wheelchair icon button's contextual menu"
          />
        </View>
      </View>

      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onShowContextualMenu}
          accessibilityLabel="Standard ContextualMenu"
          setShowMenu={toggleShowContextualMenu}
          shouldFocusOnMount={focusOnMount}
          shouldFocusOnContainer={focusOnContainer}
        >
          <ContextualMenuItem itemKey="1">
            <Checkbox label="Unchecked checkbox" />
          </ContextualMenuItem>
          <ContextualMenuItem itemKey="2">
            <IndigoHeroBold>IndigoHeroBold text with checkbox</IndigoHeroBold>
          </ContextualMenuItem>
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
          <ContextualMenuItem text="Menuitem 4" itemKey="4" />
        </ContextualMenu>
      )}
    </View>
  );
};

const ScrollViewContextualMenu: React.FunctionComponent = () => {
  const stdBtnRef = React.useRef(null);

  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [isContextualMenuVisible, setIsContextualMenuVisible] = React.useState(false);
  const [lastMenuItemClicked, setLastMenuItemClicked] = React.useState(null);

  const [isBeakVisible, setIsBeakVisible] = React.useState(false);
  const onIsBeakVisibleChange = React.useCallback((value) => setIsBeakVisible(value), []);

  const [focusOnMount, setShouldFocusOnMount] = React.useState(true);
  const toggleFocusOnMount = React.useCallback((value) => setShouldFocusOnMount(value), [setShouldFocusOnMount]);

  const [focusOnContainer, setShouldFocusOnContainer] = React.useState(false);
  const toggleFocusOnContainer = React.useCallback((value) => setShouldFocusOnContainer(value), [setShouldFocusOnContainer]);

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

  const stdMenuItemRef = React.useRef(null);

  const [showSubmenu, setShowSubmenu] = React.useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = React.useState(false);

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

  const onClick = React.useCallback(() => {
    console.log('submenu item clicked');
  }, []);

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
          <View style={{ flexDirection: 'row' }}>
            <Text>Beak Visible</Text>
            <Switch value={isBeakVisible} onValueChange={onIsBeakVisibleChange} />
          </View>
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
          <Text>
            <Text>Menu and Submenu max height set to 200</Text>
          </Text>
          <MenuButton content="Press for ContextualMenu" onClick={toggleShowContextualMenu} componentRef={stdBtnRef} />
        </View>
      </View>

      {showContextualMenu && (
        <ContextualMenu
          target={stdBtnRef}
          onDismiss={onDismissContextualMenu}
          onShow={onShowContextualMenu}
          accessibilityLabel="Standard ContextualMenu"
          onItemClick={onItemClick}
          setShowMenu={toggleShowContextualMenu}
          shouldFocusOnMount={focusOnMount}
          shouldFocusOnContainer={focusOnContainer}
          isBeakVisible={isBeakVisible}
          maxHeight={200}
        >
          <ContextualMenuItem text="MenuItem 1" itemKey="1" />
          <ContextualMenuItem text="MenuItem 2" itemKey="2" />
          <SubmenuItem
            icon={{ svgSource: svgProps, width: 12, height: 12 }}
            text="Nested Menu"
            itemKey="3"
            onHoverIn={toggleShowSubmenu}
            componentRef={stdMenuItemRef}
            expanded={showSubmenu}
          />
          {showSubmenu && (
            <Submenu
              maxHeight={200}
              target={stdMenuItemRef}
              onDismiss={onDismissSubmenu}
              onShow={onShowSubmenu}
              setShowMenu={toggleShowSubmenu}
            >
              <ContextualMenuItem text="MenuItem 4" itemKey="4" />
              <ContextualMenuItem text="MenuItem 5" itemKey="5" />
              <ContextualMenuItem text="MenuItem 6" itemKey="6" />
              <ContextualMenuItem text="MenuItem 7" itemKey="7" />
              <ContextualMenuItem
                icon={{ svgSource: svgProps, width: 12, height: 12 }}
                text="SubmenuItem svg icon"
                itemKey="8"
                onClick={onClick}
              />
              <ContextualMenuItem text="SubmenuItem 2" itemKey="9" />
              <ContextualMenuItem text="Disabled Menu Item" itemKey="10" disabled />
            </Submenu>
          )}
          <ContextualMenuItem text="Disabled Menu Item" itemKey="11" disabled />
          <ContextualMenuItem text="MenuItem 4" itemKey="12" />
          <ContextualMenuItem text="MenuItem 5" itemKey="13" />
          <ContextualMenuItem text="MenuItem 6" itemKey="14" />
          <ContextualMenuItem text="MenuItem 7" itemKey="15" />
          <ContextualMenuItem text="MenuItem 8" itemKey="16" />
          <ContextualMenuItem text="MenuItem 9" itemKey="17" />
          <ContextualMenuItem text="MenuItem 10" itemKey="18" />
          <ContextualMenuItem text="MenuItem 11" itemKey="19" />
          <ContextualMenuItem text="MenuItem 12" itemKey="20" />
        </ContextualMenu>
      )}
    </View>
  );
};

const contextualMenuSections: TestSection[] = [
  {
    name: 'Standard ContextualMenu',
    testID: CONTEXTUALMENU_TESTPAGE,
    component: ContextualMenuMainTest,
  },
  {
    name: 'Nested ContextualMenu',
    component: NestedContextualMenu,
  },
  {
    name: 'IconButton with Customized ContextualMenu',
    component: IconContextualMenu,
  },
  {
    name: 'ContextalMenu with ScrollView',
    component: ScrollViewContextualMenu,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'ContextualMenu E2E Test',
    component: E2EContextualMenuTest,
  },
];

export const ContextualMenuTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Deprecated',
    iosStatus: 'Deprecated',
    macosStatus: 'Deprecated',
    androidStatus: 'Deprecated',
  };

  const description =
    'ContextualMenus are lists of commands that are based on the context of selection, mouse hover or keyboard focus. They are one of the most effective and highly used command surfaces, and can be used in a variety of places.\n\nThere are variants that originate from a command bar, or from cursor or focus. Those that come from CommandBars use a beak that is horizontally centered on the button. Ones that come from right click and menu button do not have a beak, but appear to the right and below the cursor. ContextualMenus can have submenus from commands, show selection checks, and icons.\n\nOrganize commands in groups divided by rules. This helps users remember command locations, or find less used commands based on proximity to others. One should also group sets of mutually exclusive or multiple selectable options. Use icons sparingly, for high value commands, and don’t mix icons with selection checks, as it makes parsing commands difficult. Avoid submenus of submenus as they can be difficult to invoke or remember.';

  return (
    <Test
      name="ContextualMenu Test"
      description={description}
      sections={contextualMenuSections}
      status={status}
      e2eSections={e2eSections}
    ></Test>
  );
};
