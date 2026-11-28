import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ColorValue, Image, ImageSourcePropType, Pressable, PressableProps, View } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Icon } from '../../primitives/icon/icon';
import type { RadioState } from '../radio/radio.types';

export type SwatchSize = 'small' | 'medium' | 'large';
export type SwatchShape = 'circular' | 'square';
export type SwatchSample = { kind: 'color'; color: ColorValue } | { kind: 'image'; source: ImageSourcePropType };
export type SwatchProps = DesktopTooltipProps &
  Pick<PressableProps, 'style' | 'testID' | 'nativeID' | 'focusable'> & {
    ref?: PropsWithRefOf<typeof Pressable>['ref'];
    value: string;
    accessibilityLabel: string;
    sample: SwatchSample;
    size?: SwatchSize;
    shape?: SwatchShape;
    selected?: boolean;
    disabled?: boolean;
    onSelect?: (value: string) => void;
  };

export type SwatchState = RadioState &
  Required<Pick<SwatchProps, 'size' | 'shape'>> &
  ComponentState<{
    sample: Slot<typeof View>;
    image: OptionalSlot<typeof Image>;
    indicator: OptionalSlot<typeof View>;
    mark: OptionalSlot<typeof Icon>;
  }> & { visualState: 'rest' | 'hovered' | 'pressed' | 'disabled'; hasIdentity: boolean };
