import React from 'react';
import { Platform } from 'react-native';
import type { View } from 'react-native';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import type { MenuListProps, MenuListState, TrackedMenuItem } from './MenuList.types';
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

const platformsWithoutFocusOnDisabled = ['ios', 'macos'];
const handledKeys = ['Home', 'End'];
const handleFocusOnMouseLevae = Platform.OS === 'macos';

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

  // Handle 'Home' and 'End' keypresses here. Native menus allow 'Home' and 'End' keypresses to jump to the
  // start and end of each menu list. We need to keep track of all MenuItems in our list, and we need access to
  // (1) the item's ref to focus on and (2) whether the item is disabled or not as different platforms allow
  // and don't allow focus for disabled items.

  // Instead of calling useState to instantiate an array, we call useMemo because we don't want to re-render the
  // MenuList on adding / removing items.
  const trackedMenuItems = React.useMemo<TrackedMenuItem[]>(() => [], []);
  const trackMenuItem = React.useCallback((item: TrackedMenuItem) => trackedMenuItems.push(item), [trackedMenuItems]);
  const untrackMenuItem = React.useCallback(
    (item: TrackedMenuItem) =>
      trackedMenuItems.splice(
        trackedMenuItems.findIndex((x) => x.ref === item.ref),
        1,
      ),
    [trackedMenuItems],
  );

  const onListKeyDown = (e: InteractionEvent) => {
    const key = e.nativeEvent.key;
    if (handledKeys.includes(key)) {
      // For iOS and macOS, 'Home' and 'End' must set focus on the first and last enabled item.
      // For other platforms, we can just jump to the first and last keys.
      let increment: number, idx: number;
      if (key === 'Home') {
        increment = 1;
        idx = 0;
      } else if (key === 'End') {
        increment = -1;
        idx = trackedMenuItems.length - 1;
      }
      while (platformsWithoutFocusOnDisabled.includes(Platform.OS) && trackedMenuItems[idx].disabled) {
        idx += increment;
      }
      trackedMenuItems[idx].ref.current?.focus();
    }
  };

  React.useEffect(() => {
    return function cleanup() {
      clearTimeout(context.triggerHoverOutTimer);
    };
  });

  // focus management
  const focusZoneRef = React.useRef<View>();
  const setFocusZoneFocus = () => {
    focusZoneRef?.current?.focus();
  };

  React.useEffect(() => {
    setFocusZoneFocus();
  }, []);

  return {
    props: {
      ...context,
      onMouseLeave: handleFocusOnMouseLevae ? setFocusZoneFocus : context.onMouseLeave,
      onKeyDown: onListKeyDown,
    },
    isCheckedControlled,
    checked,
    onArrowClose,
    onCheckedChange,
    selectRadio,
    addRadioItem,
    removeRadioItem,
    trackMenuItem,
    untrackMenuItem,
    hasMaxHeight: context.hasMaxHeight ?? false,
    hasMaxWidth: context.hasMaxWidth ?? false,
    focusZoneRef: focusZoneRef,
  };
};

// Hook called in individual MenuItems to keep track of their refs - this is for "Home" and "End" functionality.
export const useMenuItemTracking = (ref: React.RefObject<View>, disabled: boolean) => {
  const { trackMenuItem, untrackMenuItem } = useMenuListContext();
  const item = React.useMemo(
    () => ({
      ref,
      disabled,
    }),
    [ref, disabled],
  );

  // We only want to call this once - when the item initially renders.
  React.useEffect(() => {
    trackMenuItem(item);
    return () => untrackMenuItem(item);
  }, []);
};
