import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { IconProps } from '../../primitives/icon/icon.types';
import type { Avatar } from '../avatar/avatar';
import type { PersonaAvatar } from '../persona/persona.types';
import type { ButtonState } from '../button/button.types';
import type { CommandPress } from '../button/commandPress';

export type InteractionTagAppearance = 'secondary' | 'primary';
export type InteractionTagSize = 'small' | 'medium';
export type InteractionTagShape = 'rounded' | 'circular';
type Media = { leadingIcon?: IconProps; avatar?: never } | { leadingIcon?: never; avatar: PersonaAvatar };
type NamedTag = { content: string; accessibilityLabel?: string } | { content?: never; accessibilityLabel: string };
export type InteractionTagProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> &
  Media &
  NamedTag & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    dismissLabel: string;
    onPress: CommandPress;
    onDismiss: () => void;
    appearance?: InteractionTagAppearance;
    size?: InteractionTagSize;
    shape?: InteractionTagShape;
    disabled?: boolean;
    primaryTestID?: string;
    dismissTestID?: string;
  };

export type InteractionTagState = ThemeState &
  Required<Pick<InteractionTagProps, 'appearance' | 'size' | 'shape'>> &
  ComponentState<{ root: Slot<typeof View>; divider: Slot<typeof View>; avatar: OptionalSlot<typeof Avatar> }> & {
    primary: ButtonState;
    remove: ButtonState;
    userStyle?: StyleProp<ViewStyle>;
    named: boolean;
  };
