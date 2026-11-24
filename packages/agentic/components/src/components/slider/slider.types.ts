import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { RangeTarget } from '@fluentui-react-native/native-core/macos';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';

export type SliderThumb = 'single' | 'lower' | 'upper';
export type SliderValue = number | readonly [number, number];
export type SliderSize = 'small' | 'medium' | 'large';
export type SliderOrientation = 'horizontal' | 'vertical';
type ValueProps<T extends SliderValue, Thumb extends SliderThumb> = {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T, details: { thumb: Thumb }) => void;
  onValueCommit?: (value: T, details: { thumb: Thumb }) => void;
};
type Common = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    accessibilityLabel: string;
    orientation?: SliderOrientation;
    size?: SliderSize;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    formatValue?: (value: number, thumb: SliderThumb) => string;
    marks?: readonly number[];
  };
export type SliderSingleProps = Common &
  ValueProps<number, 'single'> & {
    mode?: 'single';
    thumbLabels?: never;
    thumbTestID?: string;
    thumbTestIDs?: never;
  };
export type SliderRangeProps = Common &
  ValueProps<readonly [number, number], 'lower' | 'upper'> & {
    mode: 'range';
    thumbLabels: readonly [lower: string, upper: string];
    thumbTestIDs?: readonly [string, string];
    thumbTestID?: never;
  };
export type SliderProps = SliderSingleProps | SliderRangeProps;

export type SliderSegment = { fraction: number; native: PropsWithRefOf<typeof RangeTarget>; thumb: SliderThumb; active: boolean };
export type SliderState = ThemeState &
  ComponentState<{ root: Slot<typeof View>; input: Slot<typeof View>; rail: Slot<typeof View>; track: Slot<typeof View> }> & {
    segments: readonly SliderSegment[];
    Target: typeof RangeTarget;
    orientation: SliderOrientation;
    size: SliderSize;
    visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
    start: number;
    end: number;
    marks: readonly number[];
    thumbStyle?: ViewStyle;
    targetSize?: number;
    markStyle?: ViewStyle;
    userStyle?: StyleProp<ViewStyle>;
  };
