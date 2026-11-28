import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { Pressable, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Text } from '../text/text';

export type LabelSize = 'small' | 'medium' | 'large';
export type LabelWeight = 'regular' | 'strong';
export type LabelTarget = { kind: 'editor'; focus: () => void } | { kind: 'choice'; activate: () => void } | { kind: 'group' };
export type LabelProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    content: string;
    labelID?: string;
    target?: LabelTarget;
    size?: LabelSize;
    weight?: LabelWeight;
    required?: boolean;
    disabled?: boolean;
  };

export type LabelState = ThemeState &
  Required<Pick<LabelProps, 'size' | 'weight'>> &
  ComponentState<{
    root: Slot<typeof View>;
    row: Slot<typeof Pressable>;
    text: Slot<typeof Text>;
    requiredMark: OptionalSlot<typeof Text>;
  }> & { muted: boolean; hasText: boolean; userStyle?: StyleProp<ViewStyle> };
