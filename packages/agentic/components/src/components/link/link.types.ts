import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentState,
  FocusTargetBinding,
  OptionalSlot,
  PropsWithRefOf,
  Slot,
  SlotProp,
} from '@fluentui-react-native/framework-base';
import type { Pressable, StyleProp, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { Icon } from '../../primitives/icon/icon';
import type { Text } from '../text/text';

export type LinkTypography = 'functional' | 'content';
export type LinkDestination = { url: string; onNavigate?: never } | { url?: never; onNavigate: () => void };
type LinkRootProps = Partial<
  Pick<PropsWithRefOf<typeof Pressable>, 'ref' | 'testID' | 'nativeID' | 'accessibilityHint' | 'onFocus' | 'onBlur'>
>;
export type LinkProps = LinkRootProps &
  DesktopTooltipProps &
  LinkDestination & {
    content: string;
    typography?: LinkTypography;
    disabled?: boolean;
    trailingIcon?: SlotProp<typeof Icon>;
    style?: StyleProp<ViewStyle>;
  };

export type LinkState = ThemeState &
  FocusTargetBinding &
  ComponentState<
    FocusVisualsSlots & {
      root: Slot<typeof Pressable>;
      content: Slot<typeof Text>;
      trailingIcon: OptionalSlot<typeof Icon>;
    }
  > & {
    typography: LinkTypography;
    visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
    userStyle?: StyleProp<ViewStyle>;
  };
