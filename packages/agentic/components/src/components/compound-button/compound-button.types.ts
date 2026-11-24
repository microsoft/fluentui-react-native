import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { Image, ImageSourcePropType, Pressable, PressableProps, StyleProp, TextStyle, View } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { ButtonAppearance, ButtonSize, ButtonState } from '../button/button.types';
import type { Text } from '../text/text';

export type CompoundButtonAppearance = ButtonAppearance;
export type CompoundButtonSize = ButtonSize;
export type CompoundButtonSlots = { root: Slot<typeof Pressable> };

export type CompoundButtonProps = DesktopTooltipProps &
  Pick<PressableProps, 'testID' | 'nativeID' | 'style' | 'onPress' | 'onFocus' | 'onBlur' | 'onLayout' | 'accessibilityLabel'> & {
    ref?: PropsWithRefOf<typeof Pressable>['ref'];
    content: string;
    secondaryContent: string;
    appearance?: CompoundButtonAppearance;
    size?: CompoundButtonSize;
    disabled?: boolean;
    image?: ImageSourcePropType;
    contentStyle?: StyleProp<TextStyle>;
    secondaryContentStyle?: StyleProp<TextStyle>;
  };

export type CompoundButtonState = ButtonState &
  ComponentState<{
    image: OptionalSlot<typeof Image>;
    textStack: Slot<typeof View>;
    description: Slot<typeof Text>;
  }> & { secondaryContentStyle?: StyleProp<TextStyle> };
