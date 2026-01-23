/** @jsxImportSource @fluentui-react-native/framework-base */
import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';
import { SvgXml } from 'react-native-svg';

import { stylingSettings } from './MenuButton.styling';
import type { MenuButtonProps, MenuButtonType } from './MenuButton.types';
import { menuButtonName } from './MenuButton.types';
import { renderContextualMenu } from './renderContextualMenu';

const defaultIconColor = '#616161';
const primaryIconColor = '#ffffff';

export const MenuButton = compose<MenuButtonType>({
  displayName: menuButtonName,
  ...stylingSettings,
  slots: {
    root: React.Fragment,
    chevronIcon: SvgXml,
  },
  slotProps: {
    root: {},
  },
  useRender: (props: MenuButtonProps, useSlots: UseSlots<MenuButtonType>) => {
    const { menuItems, content, icon, disabled, onItemClick, contextualMenu, style, appearance, ...rest } = props;

    const stdBtnRef = useRef(null);
    const [showContextualMenu, setShowContextualMenu] = useState(false);
    const onDismiss = useCallback(() => {
      setShowContextualMenu(false);
    }, [setShowContextualMenu]);
    const toggleShowContextualMenu = useCallback(() => {
      setShowContextualMenu(!showContextualMenu);
    }, [showContextualMenu, setShowContextualMenu]);

    // Default accessibility actions to help screen readers announce expanded/collapsed state
    // Only provide on win32 to follow platform-specific accessibility patterns
    const defaultAccessibilityActions = useMemo(() => {
      if (Platform.OS === ('win32' as any)) {
        return [
          { name: 'Expand', label: 'Expand menu' },
          { name: 'Collapse', label: 'Collapse menu' },
        ];
      }
      return [];
    }, []);

    const onAccessibilityAction = useCallback(
      (event) => {
        if (Platform.OS === ('win32' as any)) {
          switch (event.nativeEvent.actionName) {
            case 'Expand':
              if (!showContextualMenu) {
                setShowContextualMenu(true);
              }
              break;
            case 'Collapse':
              if (showContextualMenu) {
                setShowContextualMenu(false);
              }
              break;
          }
        }
      },
      [showContextualMenu],
    );

    const buttonProps = {
      disabled,
      appearance,
      icon,
      style,
      componentRef: stdBtnRef,
      onClick: toggleShowContextualMenu,
      iconOnly: !content,
      accessibilityState: { expanded: showContextualMenu },
      accessibilityActions: defaultAccessibilityActions,
      onAccessibilityAction,
      ...rest,
    };

    const contextualMenuProps = {
      onItemClick,
      target: stdBtnRef,
      onDismiss,
      setShowMenu: toggleShowContextualMenu,
      ...contextualMenu,
    };

    const Slots = useSlots(props);

    return () => {
      const chevronColor = appearance === 'primary' ? primaryIconColor : defaultIconColor;
      const chevronXml = `
          <svg width="12" height="16" viewBox="0 0 11 6" color=${chevronColor}>
            <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
          </svg>`;

      return (
        <Slots.root>
          <Button {...buttonProps}>
            {content}
            <Slots.chevronIcon xml={chevronXml} />
          </Button>
          {showContextualMenu && renderContextualMenu(contextualMenuProps, menuItems)}
        </Slots.root>
      );
    };
  },
});
