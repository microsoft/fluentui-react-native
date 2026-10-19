/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { View } from 'react-native';

import type { MenuItemProps } from '../menu-item/menu-item.types';
import { renderMenuItem_unstable } from '../menu-item/renderMenuItem';
import { useMenuItem_unstable } from '../menu-item/useMenuItem';
import { useMenuItemStyles_unstable } from '../menu-item/useMenuItemStyles';
import { MenuFamilyContext, MenuLevelContext } from './menuContext';
import { MenuPopup } from './menuPopup';

type RowInstance = React.ComponentRef<typeof View>;

/**
 * A MenuItem row that declares a submenu, rendered with the child popup anchored to it. MenuItem delegates to this
 * component through its Menu context, so the row keeps MenuItem's complete pipeline.
 */
export function MenuSubmenuRow(props: MenuItemProps) {
  const family = React.useContext(MenuFamilyContext);
  const parent = React.useContext(MenuLevelContext);
  if (!family || !parent) {
    throw new Error('A submenu row must render inside a Menu.');
  }
  const anchor = family.host.useNativeViewTarget();
  const { ref: callerRef } = props;
  const rowRef = React.useCallback(
    (instance: RowInstance | null) => {
      const detach = anchor.ref(instance);
      if (typeof callerRef === 'function') {
        const cleanup = callerRef(instance);
        return () => {
          if (typeof detach === 'function') detach();
          if (typeof cleanup === 'function') cleanup();
          else callerRef(null);
        };
      }
      if (callerRef) {
        (callerRef as React.RefObject<RowInstance | null>).current = instance;
      }
      return () => {
        if (typeof detach === 'function') detach();
        if (callerRef && typeof callerRef !== 'function') {
          (callerRef as React.RefObject<RowInstance | null>).current = null;
        }
      };
    },
    [anchor, callerRef],
  );

  const state = useMenuItem_unstable({ ...props, ref: rowRef });
  useMenuItemStyles_unstable(state);
  const id = state.menuRowId;

  const { setRowTarget } = parent;
  React.useLayoutEffect(() => {
    if (!id) {
      return undefined;
    }
    setRowTarget(id, anchor.target);
    return () => setRowTarget(id, null);
  }, [anchor.target, id, setRowTarget]);

  const openChild = id !== undefined && parent.openChild?.id === id ? parent.openChild : null;
  const { children, ...surface } = props.submenu ?? { children: null };
  const row = renderMenuItem_unstable(state);
  if (!id) {
    return row;
  }
  return (
    <>
      {row}
      <MenuPopup
        level={parent.level + 1}
        open={openChild !== null}
        anchorTarget={anchor.target}
        placement={{ side: 'end', align: 'start' }}
        tabNavigation="dismiss"
        surface={surface}
        label={state.contentText}
        entry={openChild?.entry ?? 'none'}
        entryKey={openChild?.key ?? 0}
        onDismissed={(reason) => parent.onChildDismissed(id, reason)}
        parent={{ level: parent, rowId: id }}
      >
        {children}
      </MenuPopup>
    </>
  );
}
