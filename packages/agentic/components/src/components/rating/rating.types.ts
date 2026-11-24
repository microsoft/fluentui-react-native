import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { RangeTarget } from '@fluentui-react-native/native-core/macos';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { RatingItemFill, RatingItemSize } from '../rating-item/rating-item.types';

export type RatingSize = RatingItemSize;
export type RatingProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
    max?: number;
    step?: 0.5 | 1;
    size?: RatingSize;
    accessibilityLabel: string;
    formatValue: (value: number | null, max: number) => string;
    disabled?: boolean;
    targetTestID?: string;
  };

export type RatingState = ThemeState &
  ComponentState<{ root: Slot<typeof View>; input: Slot<typeof View>; target: Slot<typeof RangeTarget> }> & {
    stars: readonly RatingItemFill[];
    size: RatingSize;
    disabled: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
