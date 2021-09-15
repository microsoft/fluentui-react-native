/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { ImageURISource, NativeModules, ViewProps, ColorValue } from 'react-native';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const avatarName = 'Avatar';

const NativeAvatarView = ensureNativeComponent('FRNAvatarView');

export type Size = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | 'xxLarge';

export type AvatarStyle = 'default' | 'accent' | 'group' | 'outlined' | 'outlinedPrimary' | 'overflow';

export type Presence = 'none' | 'available' | 'away' | 'blocked' | 'doNotDisturb' | 'offline' | 'unknown';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants = NativeModules.FRNAvatarViewManager;

export type AvatarTokens = {
  /**
   * Supported Avatar sizes
   */
  size?: Size;

  /**
   * Supported Avatar styles
   */
  avatarStyle?: AvatarStyle;
};

export type AvatarProps = AvatarTokens & {
  /**
   * The image to be displayed
   */
  imageSource?: ImageURISource;

  /**
   * The primary text to create initials with (e.g. a name)
   */
  primaryText?: string;

  /**
   * The secondary text to create initials with if primary text is not provided (e.g. an email address)
   */
  secondaryText?: string;

  /**
   * A custom color for the ring around the Avatar
   */
  ringColor?: ColorValue;

  /**
   * A custom color for the avatar initials when no image is shown
   */
  foregroundColor?: ColorValue;

  /**
   * A custom color for the avatar background when no image is shown
   */
  backgroundColor?: ColorValue;

  /**
   * The avatar view's presence state.
   */
  presence?: Presence;

  /**
   * A boolean inidicating whether the ring is visible
   */
  isRingVisible?: boolean;

  /**
   * A boolean indicating whether the Inner Ring Gap is transparent
   */
  isTransparent?: boolean;

  /**
   * A boolean indicating out of office status
   */
  isOutOfOffice?: boolean;

  /**
   * A boolean indicating whether the gap between the avatar and ring is visible.
   */
  hasRingInnerGap?: boolean;

  /**
   * An image to be shown as the backdrop of the ring, rather then a solid color.
   * Takes precendence over `ringColor`
   */
  customBorderImageSource?: ImageURISource;
};

const tokensThatAreAlsoProps: (keyof AvatarTokens)[] = ['size', 'avatarStyle'];

export type NativeAvatarViewProps = ViewProps & AvatarProps;
interface AvatarType {
  props: AvatarProps;
  slotProps: { root: NativeAvatarViewProps };
  tokens: AvatarTokens;
}

export const Avatar = compose<AvatarType>({
  displayName: avatarName,
  tokens: [
    {
      size: 'small',
      avatarStyle: 'default',
    },
    avatarName,
  ],
  tokensThatAreAlsoProps,
  slots: { root: NativeAvatarView },
  slotProps: {
    root: buildProps<NativeAvatarViewProps, AvatarTokens>(
      tokens => ({
        size: tokens.size,
        style: {
          height: ExportedNativeConstants.sizes[tokens.size],
          width: ExportedNativeConstants.sizes[tokens.size],
        },
      }),
      ['size'],
    ),
  },
  render: (props: AvatarProps, useSlots: UseSlots<AvatarType>) => {
    const Root = useSlots(props).root;

    return (rest: AvatarProps) => <Root {...mergeProps(props, rest)} />;
  },
});
