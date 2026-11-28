import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { LayoutRectangle, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { SwatchSample, SwatchShape, SwatchSize } from '../swatch/swatch.types';

export type SwatchPickerLayout = 'row' | 'grid';
export type SwatchPickerItem<Sample extends SwatchSample = SwatchSample> = {
  value: string;
  accessibilityLabel: string;
  sample: Sample;
  testID?: string;
  disabled?: boolean;
};
export type SwatchPickerItems =
  | readonly SwatchPickerItem<Extract<SwatchSample, { kind: 'color' }>>[]
  | readonly SwatchPickerItem<Extract<SwatchSample, { kind: 'image' }>>[];

export type SwatchPickerProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    items: SwatchPickerItems;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    accessibilityLabel: string;
    layout?: SwatchPickerLayout;
    shape?: SwatchShape;
    size?: SwatchSize;
  };

export type SwatchPickerState = ThemeState &
  ComponentState<{ root: Slot<typeof View> }> & {
    items: readonly SwatchPickerItem[];
    layout: SwatchPickerLayout;
    size: SwatchSize;
    shape: SwatchShape;
    selectedValue: string | null;
    userStyle?: StyleProp<ViewStyle>;
    focus: KeyedFocus;
    select(value: string): void;
    measure: (value: string, rect: LayoutRectangle) => void;
  };
