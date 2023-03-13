import React from 'react';
import type { View } from 'react-native';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import type { MenuListProps, MenuListState } from './MenuList.types';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';

// Track the radio items so we know what to clear selection from when selectRadio is called
// Purposefully left out of the hook because
// 1. RadioItems just keeps track of information - changing this array doesn't need to force rerender
// 2. Keeping them here means these consts are not recreated on every render, which would force rerendering of all children
const radioItems = [];
const addRadioItem = (name: string) => {
  radioItems.push(name);
};
const removeRadioItem = (name: string) => {
  radioItems.filter((item) => item !== name);
};

export const useMenuList = (_props: MenuListProps): MenuListState => {
  const context = useMenuContext();

  // MenuList v2 needs to be able to be standalone, but this is not in scope for v1
  // Assuming that checked information will come from parent Menu
  const { defaultChecked, onCheckedChange: onCheckedChangeOriginal, checked: checkedOriginal, isSubmenu, setOpen, triggerRef } = context;

  // Convert passed in array to map so that i's easier to look up checked state
  const checkedMap = React.useMemo(() => {
    const state = {};
    if (!checkedOriginal) {
      return state;
    }

    for (const key of checkedOriginal) {
      state[key] = true;
    }
    return state;
  }, [checkedOriginal]);

  const [checkedInternal, setCheckedInternal] = React.useState<Record<string, boolean>>(() => {
    if (checkedMap) {
      return checkedMap;
    }

    const initialChecked = defaultChecked ?? [];
    const state = {};
    for (const key of initialChecked) {
      state[key] = true;
    }
    return state;
  });

  const isCheckedControlled = typeof checkedOriginal !== 'undefined';
  const checked = isCheckedControlled ? checkedMap : checkedInternal;

  const onCheckedChange = React.useCallback(
    (e: InteractionEvent, name: string, isChecked: boolean) => {
      const updatedChecked = { ...checked };
      if (isChecked) {
        updatedChecked[name] = true;
      } else {
        delete updatedChecked[name];
      }

      if (!isCheckedControlled) {
        setCheckedInternal(updatedChecked);
      }

      if (onCheckedChangeOriginal) {
        onCheckedChangeOriginal(e, Object.keys(updatedChecked));
      }
    },
    [isCheckedControlled, checked, onCheckedChangeOriginal, setCheckedInternal],
  );

  const selectRadio = React.useCallback(
    (e: InteractionEvent, name: string) => {
      const updatedChecked = {};
      for (const checkedName of Object.keys(checked)) {
        if (!radioItems.includes(checkedName)) {
          // Preserve checked state if non-radio items
          updatedChecked[checkedName] = checked[checkedName];
        }
      }
      updatedChecked[name] = true;

      if (!isCheckedControlled) {
        setCheckedInternal(updatedChecked);
      }

      if (onCheckedChangeOriginal) {
        onCheckedChangeOriginal(e, Object.keys(updatedChecked));
      }
    },
    [isCheckedControlled, onCheckedChangeOriginal, setCheckedInternal, checked],
  );

  // The close arrow key must be handled at this level so that close arrow is responsive when arrowing
  // on a submenu trigger inside a submenu. Otherwise the arrowing event gets "swallowed up" by the trigger,
  // because it is considered to be inside the submenu due to the Menu component wrapping both the
  // trigger and popover. Listening to key events directly here to handle this case doesn't work
  // since left and right arrow key events are already handled and swallowed by native behavior
  const onArrowClose = React.useCallback(
    (e: InteractionEvent) => {
      if (!isSubmenu) {
        return;
      }

      setOpen(e, false /* isOpen */, false /* bubble */);
      triggerRef?.current?.focus();
    },
    [isSubmenu, setOpen, triggerRef],
  );

  const [menuItemRefs, setMenuItemRefs] = React.useState<React.RefObject<View>[]>([]);
  const addMenuItemRef = React.useCallback((ref: React.RefObject<View>) => setMenuItemRefs((prev) => [...prev, ref]), [setMenuItemRefs]);
  const removeMenuItemRef = React.useCallback(
    (ref: React.RefObject<View>) => setMenuItemRefs((prev) => prev.filter((item) => item !== ref)),
    [setMenuItemRefs],
  );

  const onListKeyDown = (e: InteractionEvent) => {
    let ref: React.RefObject<View> | null;
    if (e.nativeEvent.key === 'Home') {
      ref = menuItemRefs[0];
    } else if (e.nativeEvent.key === 'End') {
      ref = menuItemRefs[menuItemRefs.length - 1];
    }
    if (ref) {
      ref.current.focus();
    }
  };

  React.useEffect(() => {
    return function cleanup() {
      clearTimeout(context.triggerHoverOutTimer);
    };
  });

  return {
    props: {
      ...context,
    },
    isCheckedControlled,
    checked,
    onArrowClose,
    onCheckedChange,
    selectRadio,
    addRadioItem,
    removeRadioItem,
    addMenuItemRef,
    removeMenuItemRef,
    onListKeyDown,
    hasMaxHeight: context.hasMaxHeight,
    hasMaxWidth: context.hasMaxWidth,
  };
};

export const useMenuItemRefMountUnmount = (ref: React.RefObject<View>) => {
  const { addMenuItemRef, removeMenuItemRef } = useMenuListContext();
  React.useEffect(() => {
    addMenuItemRef(ref);
    return () => removeMenuItemRef(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
