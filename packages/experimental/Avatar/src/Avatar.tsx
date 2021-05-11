/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots, ColorValue } from '@fluentui-react-native/framework';
import { ImageURISource, NativeModules, ViewProps } from 'react-native';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const avatarName = 'Avatar';

const NativeAvatarView = ensureNativeComponent('MSFAvatarView');

export type Size = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | 'xxLarge';

export type AvatarStyle = 'default' | 'accent' | 'group' | 'outlined' | 'outlinedPrimary' | 'overflow';

export type Presence = 'none' | 'available' | 'away' | 'blocked' | 'doNotDisturb' | 'offline' | 'unknown';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants = NativeModules.MSFAvatarViewManager;

export type AvatarProps = {
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

  ringColor?: ColorValue;

  foregroundColor?: ColorValue;

  backgroundColor?: ColorValue;

  /**
   * The avatar view's presence state.
   */
  presence?: Presence;

  isRingVisible?: boolean;

  isTransparent?: boolean;

  isOutOfOffice?: boolean;
};

export type AvatarTokens = {
  /**
   * Supported Avatar sizes
   */
  size?: Size;

  /**
   * Supported Avatar styles
   */
  style: AvatarStyle;
};

const tokensThatAreAlsoProps: (keyof AvatarTokens)[] = ['size', 'style'];

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
      style: 'default',
    },
    avatarName,
  ],
  tokensThatAreAlsoProps,
  slots: { root: NativeAvatarView },
  slotProps: {
    root: buildProps<NativeAvatarViewProps, AvatarTokens>(
      (tokens) => ({
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
