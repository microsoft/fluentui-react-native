import { Image, Platform, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { resolveAccessibilityAction, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../../primitives/icon/icon';
import { getButtonVisualState } from '../button/button.styles';
import { useRadio_unstable } from '../radio/useRadio';
import type { SwatchProps, SwatchState } from './swatch.types';

const hidden = { ...hiddenFromAccessibilityProps, pointerEvents: 'none' } as const;

export function useSwatch_unstable(props: SwatchProps): SwatchState {
  return useSwatch(props);
}

export function useSwatch(
  {
    value,
    sample,
    onSelect,
    accessibilityLabel,
    disabled = false,
    selected = false,
    size = 'medium',
    shape = 'circular',
    ...props
  }: SwatchProps,
  afterPress?: (event: GestureResponderEvent) => void,
): SwatchState {
  const action = resolveAccessibilityAction('select', Platform.OS, []);
  const select = !disabled && onSelect ? () => onSelect(value) : undefined;
  const radio = useRadio_unstable({
    ...props,
    accessibilityLabel,
    disabled,
    selected,
    accessibilityActions: [{ name: action.name, label: accessibilityLabel }],
    onPress:
      select && afterPress
        ? (event) => {
            select();
            afterPress(event);
          }
        : select,
    onAccessibilityAction: select
      ? (event) => {
          if (event.nativeEvent.actionName === action.name) select();
        }
      : undefined,
  });
  return {
    ...radio,
    size,
    shape,
    hasIdentity: !!value.trim() && !!accessibilityLabel.trim(),
    visualState: getButtonVisualState(disabled, radio.pressed, radio.hovered),
    sample: useSlot(View, { ...hidden, style: sample.kind === 'color' ? { backgroundColor: sample.color } : undefined }),
    image: useOptionalSlot(
      Image,
      sample.kind === 'image' ? { ...hiddenFromAccessibilityProps, source: sample.source, resizeMode: 'cover' } : null,
    ),
    indicator: useOptionalSlot(View, selected ? hidden : null),
    mark: useOptionalSlot(Icon, selected ? { ...hiddenFromAccessibilityProps, fontSource: semanticIconSources.checkmark } : null),
  };
}
