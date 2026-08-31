import * as React from 'react';
import { View } from 'react-native';
import type { Pressable } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useSlot } from '@fluentui-react-native/framework-base';

import { Tab } from '../tab/tab';
import type { TabProps } from '../tab/tab.types';
import type { TabListContextValue } from './TabListContext';
import type { TabKeyEvent, TabListProps, TabListState } from './tablist.types';

type TabItem = {
  disabled: boolean;
  value: string;
};

function isTabElement(child: React.ReactNode): child is React.ReactElement<TabProps> {
  return React.isValidElement(child) && child.type === Tab;
}

function getTabItems(children: React.ReactNode, listDisabled: boolean): TabItem[] {
  const items: TabItem[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      const fragmentProps = child.props as { children?: React.ReactNode };
      items.push(...getTabItems(fragmentProps.children, listDisabled));
    } else if (isTabElement(child)) {
      const childProps = child.props as TabProps;
      const value = childProps.value ?? childProps.controls;
      if (value) {
        items.push({ disabled: listDisabled || Boolean(childProps.disabled), value });
      }
    }
  });

  return items;
}

function findEnabledValue(items: TabItem[], value: string | undefined): string | undefined {
  return items.find((item) => item.value === value && !item.disabled)?.value;
}

export function useTabList_unstable(props: TabListProps): TabListState {
  const {
    children,
    circularNavigation = true,
    defaultSelectedValue,
    disabled = false,
    onSelectionChange,
    orientation = 'horizontal',
    selectedValue: selectedValueProp,
    selectionFollowsFocus = true,
    style,
    ...rest
  } = props;
  const themeState = useThemeState();
  const items = React.useMemo(() => getTabItems(children, disabled), [children, disabled]);
  const firstEnabledValue = items.find((item) => !item.disabled)?.value;
  const initialSelection = findEnabledValue(items, defaultSelectedValue) ?? firstEnabledValue;
  const [selectedValue, setSelectedValue] = useControllableValue(
    selectedValueProp,
    initialSelection,
    (nextValue) => nextValue !== undefined && onSelectionChange?.(nextValue),
  );
  const [activeValue, setActiveValue] = React.useState<string | undefined>(
    () => findEnabledValue(items, selectedValueProp ?? initialSelection) ?? firstEnabledValue,
  );
  const tabRefs = React.useRef(new Map<string, React.RefObject<React.ElementRef<typeof Pressable> | null>>());
  const previousSelectedValue = React.useRef(selectedValue);

  React.useEffect(() => {
    const seen = new Set<string>();
    const duplicate = items.find((item) => {
      if (seen.has(item.value)) {
        return true;
      }
      seen.add(item.value);
      return false;
    });

    if (__DEV__ && duplicate) {
      console.error(`TabList values must be unique. Duplicate value: "${duplicate.value}".`);
    }
  }, [items]);

  React.useEffect(() => {
    const selectedEnabledValue = findEnabledValue(items, selectedValue);
    const selectionChanged = previousSelectedValue.current !== selectedValue;
    previousSelectedValue.current = selectedValue;
    if (selectedValueProp === undefined && selectedEnabledValue === undefined && firstEnabledValue !== undefined) {
      setSelectedValue(firstEnabledValue);
    }
    setActiveValue((currentValue) => {
      if (selectionChanged && selectedEnabledValue !== undefined) {
        return selectedEnabledValue;
      }
      return findEnabledValue(items, currentValue) ?? selectedEnabledValue ?? firstEnabledValue;
    });
  }, [firstEnabledValue, items, selectedValue, selectedValueProp, setSelectedValue]);

  const requestSelection = React.useCallback(
    (value: string) => {
      const item = items.find((candidate) => candidate.value === value);
      if (!item || item.disabled) {
        return;
      }
      setActiveValue(value);
      setSelectedValue(value);
    },
    [items, setSelectedValue],
  );

  const onTabFocus = React.useCallback(
    (value: string) => {
      if (findEnabledValue(items, value)) {
        setActiveValue(value);
      }
    },
    [items],
  );

  const onTabKeyDown = React.useCallback(
    (value: string, event: TabKeyEvent) => {
      const key = event.nativeEvent?.key;
      const enabledItems = items.filter((item) => !item.disabled);
      const currentIndex = enabledItems.findIndex((item) => item.value === value);
      if (currentIndex < 0 || enabledItems.length === 0) {
        return;
      }

      const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      let nextIndex: number | undefined;

      if (key === 'Home') {
        nextIndex = 0;
      } else if (key === 'End') {
        nextIndex = enabledItems.length - 1;
      } else if (key === previousKey) {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = circularNavigation ? enabledItems.length - 1 : currentIndex;
        }
      } else if (key === nextKey) {
        nextIndex = currentIndex + 1;
        if (nextIndex >= enabledItems.length) {
          nextIndex = circularNavigation ? 0 : currentIndex;
        }
      } else {
        return;
      }

      event.preventDefault?.();
      const nextValue = enabledItems[nextIndex].value;
      if (nextValue === value) {
        return;
      }
      setActiveValue(nextValue);
      if (selectionFollowsFocus) {
        setSelectedValue(nextValue);
      }
      tabRefs.current.get(nextValue)?.current?.focus?.();
    },
    [circularNavigation, items, orientation, selectionFollowsFocus, setSelectedValue],
  );

  const getPosition = React.useCallback(
    (value: string) => {
      const position = items.findIndex((item) => item.value === value);
      return position < 0 ? undefined : position + 1;
    },
    [items],
  );

  const registerTab = React.useCallback((value: string, ref: React.RefObject<React.ElementRef<typeof Pressable> | null>) => {
    tabRefs.current.set(value, ref);
    return () => {
      if (tabRefs.current.get(value) === ref) {
        tabRefs.current.delete(value);
      }
    };
  }, []);

  const contextValue = React.useMemo<TabListContextValue>(
    () => ({
      activeValue,
      disabled,
      getPosition,
      isTabDisabled: (value, tabDisabled) => tabDisabled || disabled || !items.some((item) => item.value === value),
      onTabFocus,
      onTabKeyDown,
      onTabPress: requestSelection,
      orientation,
      registerTab,
      selectedValue,
      setSize: items.length,
    }),
    [activeValue, disabled, getPosition, items, onTabFocus, onTabKeyDown, orientation, registerTab, requestSelection, selectedValue],
  );

  const root = useSlot(View, {
    ...rest,
    accessibilityRole: 'tablist',
    accessibilityState: { disabled },
    accessible: true,
    focusable: false,
  });

  return {
    children,
    contextValue,
    orientation,
    root,
    userStyle: style,
    ...themeState,
  };
}
