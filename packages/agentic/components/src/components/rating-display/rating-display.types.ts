import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { View, ViewProps, ViewStyle, StyleProp } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { RatingItemFill, RatingItemSize } from '../rating-item/rating-item.types';
import type { Text } from '../text/text';

export type RatingDisplayLayout = 'default' | 'compact';
export type RatingDisplaySize = RatingItemSize;
export type RatingDisplaySlots = { root: Slot<typeof View> };

type RatingDisplaySummary =
  | { decorative: true; formatSummary?: never }
  | { decorative?: false; formatSummary: (value: number, max: number, count?: number) => string };

export type RatingDisplayProps = Pick<ViewProps, 'style' | 'testID' | 'nativeID'> &
  DesktopTooltipProps &
  RatingDisplaySummary & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    value: number;
    max?: number;
    count?: number;
    formatNumber?: (value: number) => string;
    layout?: RatingDisplayLayout;
    size?: RatingDisplaySize;
  };

export type RatingDisplayState = ThemeState &
  ComponentState<
    RatingDisplaySlots & {
      stars: OptionalSlot<typeof View>;
      value: OptionalSlot<typeof Text>;
      count: OptionalSlot<typeof Text>;
    }
  > & {
    size: RatingDisplaySize;
    fills: readonly RatingItemFill[];
    userStyle?: StyleProp<ViewStyle>;
  };
