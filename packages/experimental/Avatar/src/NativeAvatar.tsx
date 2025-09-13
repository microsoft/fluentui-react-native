/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */
/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ImageURISource, ViewProps, ColorValue } from 'react-native';
import { NativeModules, TurboModuleRegistry } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, buildProps, mergeProps } from '@fluentui-react-native/framework';

const avatarName = 'NativeAvatar';

import NativeAvatarView from './AvatarNativeComponent';

export const Sizes = ['size16', 'size20', 'size24', 'size32', 'size40', 'size56', 'size72'] as const;
export type Size = (typeof Sizes)[number];

export type AvatarStyle = 'default' | 'accent' | 'group' | 'outlined' | 'outlinedPrimary' | 'overflow';

export type Presence = 'none' | 'available' | 'away' | 'blocked' | 'doNotDisturb' | 'offline' | 'unknown';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants =
  TurboModuleRegistry.get('FRNAvatarConstants')?.getConstants() || NativeModules.FRNAvatarViewManager;

export type NativeAvatarTokens = {
  /**
   * Supported Avatar sizes
   */
  size?: Size;

  /**
   * Supported Avatar styles
   */
  avatarStyle?: AvatarStyle;
};

export type NativeAvatarProps = NativeAvatarTokens & {
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

const tokensThatAreAlsoProps: (keyof NativeAvatarTokens)[] = ['size', 'avatarStyle'];

export type NativeAvatarViewProps = ViewProps & NativeAvatarProps;
interface AvatarType {
  props: NativeAvatarProps;
  slotProps: { root: NativeAvatarViewProps };
  tokens: NativeAvatarTokens;
}

export const NativeAvatar = compose<AvatarType>({
  displayName: avatarName,
  tokens: [
    {
      size: 'size24',
      avatarStyle: 'default',
    },
    avatarName,
  ],
  tokensThatAreAlsoProps,
  slots: { root: NativeAvatarView },
  slotProps: {
    root: buildProps<NativeAvatarViewProps, NativeAvatarTokens>(
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
  useRender: (props: NativeAvatarProps, useSlots: UseSlots<AvatarType>) => {
    const Root = useSlots(props).root;

    return (rest: NativeAvatarProps) => <Root {...mergeProps(props, rest)} />;
  },
});
