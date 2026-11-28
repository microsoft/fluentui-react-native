import { Children, Fragment, isValidElement, useEffect, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useSlot } from '@fluentui-react-native/framework-base';
import { useKeyedFocus } from '../../common/useKeyedFocus';
import { Button } from '../button/button';
import type { ButtonProps } from '../button/button.types';
import { Divider } from '../divider/divider';
import type { DividerProps } from '../divider/divider.types';
import { ToggleButton } from '../toggle-button/toggle-button';
import type { ToggleButtonProps } from '../toggle-button/toggle-button.types';
import type { ToolbarItem, ToolbarProps, ToolbarState } from './toolbar.types';

function readItems(children: ReactNode) {
  const items: ToolbarItem[] = [];
  const keys = new Set<string>();
  let invalid = false;
  const append = (nodes: ReactNode, parent: string) => {
    for (const node of Children.toArray(nodes)) {
      if (!isValidElement(node)) {
        invalid = true;
        continue;
      }
      const value = `${parent}${JSON.stringify(node.key)}/`;
      if (node.type === Fragment) {
        append((node.props as { children?: ReactNode }).children, value);
      } else if (node.type === Divider) {
        items.push({ kind: 'divider', value, element: node as ReactElement<DividerProps> });
      } else if ((node.type === Button || node.type === ToggleButton) && node.key !== null && !keys.has(value)) {
        keys.add(value);
        const element = node as ReactElement<ButtonProps | ToggleButtonProps>;
        const disabled = !!element.props.disabled || element.props.focusable === false;
        items.push(
          node.type === Button
            ? { kind: 'button', value, disabled, element: node as ReactElement<ButtonProps> }
            : { kind: 'toggle', value, disabled, element: node as ReactElement<ToggleButtonProps> },
        );
      } else {
        invalid = true;
      }
    }
  };
  append(children, '');
  return { items, invalid };
}

export function useToolbar_unstable({
  children,
  accessibilityLabel,
  size = 'large',
  style: userStyle,
  ...rootProps
}: ToolbarProps): ToolbarState {
  const { items, invalid } = useMemo(() => readItems(children), [children]);
  useEffect(() => {
    if (__DEV__ && invalid) console.warn('Toolbar: use Button and ToggleButton commands and optional Dividers.');
  }, [invalid]);
  useAccessibilityLabelWarning({
    componentName: 'Toolbar',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'Toolbar: give the command group an accessibilityLabel.',
  });
  return {
    ...useThemeState(),
    items,
    size,
    userStyle,
    focus: useKeyedFocus(
      items.filter((item) => item.kind !== 'divider'),
      { mode: 'horizontal', remember: true },
    ),
    root: useSlot(View, { ...rootProps, accessible: true, accessibilityRole: 'toolbar', accessibilityLabel, focusable: false }),
  };
}
