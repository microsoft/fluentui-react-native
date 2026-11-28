import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { chooseAdjacentKey, uniqueByKey } from '../../common/keyedCollection';
import { useKeyedFocus } from '../../common/useKeyedFocus';
import type { ListProps, ListState } from './list.types';

export function useList_unstable({
  items: supplied,
  renderItem,
  navigationMode = 'passive',
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  onAction,
  size = 'medium',
  accessibilityLabel,
  style: userStyle,
  ...rootProps
}: ListProps): ListState {
  const items = useMemo(() => uniqueByKey(supplied, (entry) => entry.key).filter((entry) => entry.label.trim()), [supplied]);
  useEffect(() => {
    if (__DEV__ && items.length !== supplied.length) console.warn('List: provide unique nonblank keys and labels.');
  }, [items.length, supplied.length]);
  const [values, setValues] = useControllableValue<readonly string[]>(selectedKeys, defaultSelectedKeys);
  const byKey = new Map(items.map((entry) => [entry.key, entry]));
  const valid = [...new Set<string>(values ?? [])].filter((key) => byKey.has(key));
  const selected = new Set(selectionMode === 'none' ? [] : selectionMode === 'single' ? valid.slice(0, 1) : valid);
  const mode = selectionMode !== 'none' || onAction ? 'items' : navigationMode;
  if (mode === 'items' && String(Platform.OS) === 'win32') {
    throw new Error('List items mode requires a qualified Office Win32 child host. Passive List remains available.');
  }
  const eligible = new Set(items.filter((entry) => !entry.disabled).map((entry) => entry.key));
  const previous = useRef(items.map((entry) => entry.key));
  const focus = useKeyedFocus(mode === 'items' ? items.map((item) => ({ value: item.key, disabled: item.disabled })) : [], {
    mode: 'vertical',
    remember: true,
    recoverValue: (key) => chooseAdjacentKey(key, previous.current, eligible),
  });
  useLayoutEffect(() => {
    previous.current = items.map((entry) => entry.key);
  }, [items]);

  const activate: ListState['activate'] = (key, mechanism) => {
    if (mode !== 'items' || !eligible.has(key)) return;
    let prevented = false;
    if (mechanism === 'primary' || (mechanism === 'space' && selectionMode === 'none')) {
      onAction?.(key, {
        preventSelection: () => {
          prevented = true;
        },
      });
    }
    if (prevented || selectionMode === 'none') return;
    if (selected.has(key) && (selectionMode === 'single' || mechanism === 'select')) return;
    const next =
      selectionMode === 'single' ? [key] : selected.has(key) ? [...selected].filter((value) => value !== key) : [...selected, key];
    setValues(next);
    onSelectionChange?.(next, { key });
  };

  return {
    ...useThemeState(),
    items,
    renderItem,
    size,
    itemSize: size,
    navigationMode: mode,
    selectionMode,
    selected,
    userStyle,
    focus,
    activate,
    root: useSlot(View, {
      ...rootProps,
      accessibilityRole: 'list',
      accessibilityLabel,
      accessible: true,
      focusable: false,
      accessibilityState: { ...(selectionMode === 'multiple' && { multiselectable: true }) },
    }),
  };
}
