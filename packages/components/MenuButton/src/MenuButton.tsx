/** @jsxImportSource @fluentui-react-native/framework-base */
import React, { useRef, useState, useCallback } from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu } from '@fluentui-react-native/contextual-menu';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import type { ISlots } from '@uifabricshared/foundation-composable';
import type { IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { SvgXml } from 'react-native-svg';

import { defaultIconColor, primaryIconColor } from './MenuButton.style';
import type {
  MenuButtonProps,
  MenuButtonSlotProps,
  MenuButtonType,
  MenuButtonRenderData,
  MenuButtonState,
  MenuButtonItemProps,
} from './MenuButton.types';
import { MenuButtonName } from './MenuButton.types';

export const MenuButton = compose<MenuButtonType>({
  displayName: MenuButtonName,
  usePrepareProps: (userProps: MenuButtonProps, useStyling: IUseComposeStyling<MenuButtonType>) => {
    const { menuItems, content, startIcon, endIcon, disabled, onItemClick, contextualMenu, primary, ...rest } = userProps;

    const stdBtnRef = useRef(null);
    const [showContextualMenu, setShowContextualMenu] = useState(false);

    const onDismiss = useCallback(() => {
      setShowContextualMenu(false);
    }, [setShowContextualMenu]);

    const toggleShowContextualMenu = useCallback(() => {
      setShowContextualMenu(!showContextualMenu);
    }, [showContextualMenu, setShowContextualMenu]);

    const state: MenuButtonState = {
      context: {
        showContextualMenu: !!showContextualMenu,
        primary: !!primary,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    const buttonProps = {
      disabled,
      content,
      icon: startIcon != undefined ? startIcon : endIcon,
      iconPosition: startIcon != undefined ? 'before' : 'after',
      componentRef: stdBtnRef,
      onClick: toggleShowContextualMenu,
      iconOnly: content == undefined ? true : false,
      ...rest,
    };

    const slotProps = mergeSettings<MenuButtonSlotProps>(styleProps, {
      root: {},
      button: buttonProps,
      primaryButton: {
        appearance: 'primary',
        ...buttonProps,
      },
      contextualMenu: {
        onItemClick,
        target: stdBtnRef,
        onDismiss,
        setShowMenu: toggleShowContextualMenu,
        ...contextualMenu,
      },
      contextualMenuItems: {
        menuItems,
      },
    });

    return { slotProps, state };
  },
  slots: {
    root: React.Fragment,
    button: { slotType: Button as React.ComponentType },
    primaryButton: { slotType: Button as React.ComponentType },
    contextualMenu: { slotType: ContextualMenu as React.ComponentType },
    contextualMenuItems: React.Fragment,
    chevronSvg: SvgXml,
  },
  styles: {
    contextualMenu: [backgroundColorTokens, borderTokens],
    button: [backgroundColorTokens, borderTokens],
  },
  render: (Slots: ISlots<MenuButtonSlotProps>, renderData: MenuButtonRenderData) => {
    if (!(renderData.state && renderData.slotProps)) {
      return null;
    }
    const context = renderData.state!.context;
    const menuItems = renderData.slotProps!.contextualMenuItems ? renderData.slotProps!.contextualMenuItems.menuItems : [];

    const chevronColor = context.primary ? primaryIconColor : defaultIconColor;
    const chevronXml = `
    <svg width="12" height="16" viewBox="0 0 11 6" color=${chevronColor}>
      <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
    </svg>`;

    return (
      <Slots.root>
        {context.primary ? (
          <Slots.primaryButton>
            {renderData.slotProps.primaryButton.content}
            <Slots.chevronSvg xml={chevronXml} />
          </Slots.primaryButton>
        ) : (
          <Slots.button>
            {renderData.slotProps.button.content}
            <Slots.chevronSvg xml={chevronXml} />
          </Slots.button>
        )}
        {context.showContextualMenu && (
          <Slots.contextualMenu>
            {menuItems.map((menuItem) => {
              return menuItem.hasSubmenu && menuItem.submenuItems ? (
                <Slots.contextualMenuItems>
                  <SubMenuItem {...menuItem} />
                </Slots.contextualMenuItems>
              ) : (
                <ContextualMenuItem key={menuItem.itemKey} {...menuItem} />
              );
            })}
          </Slots.contextualMenu>
        )}
      </Slots.root>
    );
  },
});

const SubMenuItem: React.FunctionComponent<MenuButtonItemProps> = (props: MenuButtonItemProps): JSX.Element => {
  const [showSubmenuState, setShowSubmenu] = React.useState(false);
  const toggleShowSubmenu = React.useCallback(() => {
    setShowSubmenu(!showSubmenuState);
  }, [showSubmenuState, setShowSubmenu]);
  const onDismissSubmenu = React.useCallback(() => {
    setShowSubmenu(false);
  }, [setShowSubmenu]);

  const { showSubmenu = showSubmenuState, submenuProps, componentRef, submenuItems, onHoverIn = toggleShowSubmenu, ...restItems } = props;
  const { onDismiss = onDismissSubmenu, setShowMenu = toggleShowSubmenu, ...restSubmenuProps } = submenuProps;

  return (
    <React.Fragment>
      <SubmenuItem componentRef={componentRef} onHoverIn={onHoverIn} {...restItems} />
      {showSubmenu && (
        <Submenu target={componentRef} onDismiss={onDismiss} setShowMenu={setShowMenu} {...restSubmenuProps}>
          {submenuItems?.map((submenuItem) => (
            <ContextualMenuItem key={submenuItem.itemKey} {...submenuItem} />
          ))}
        </Submenu>
      )}
    </React.Fragment>
  );
};

export default MenuButton;
