/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Image, NativeModules, ViewProps } from 'react-native';
import * as React from 'react';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const avatarName = 'MSFAvatarView';

const NativeAvatarView = ensureNativeComponent(avatarName);

export type Size = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | 'xxLarge';

export type Presence = 'none' | 'available' | 'away' | 'doNotDisturb' | 'outOfOffice' | 'offline' | 'unknown' | 'unknown' | 'blocked';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants = NativeModules.MSFAvatarViewManager;

export type AvatarTokens = {
  /**
   * Supported Avatar sizes
   */
  size?: Size;
};

export type AvatarProps = ViewProps & {
  /**
   * Supported Avatar sizes
   */
  size?: Size;

  backgroundColor?: string;

  /**
   * Image to be used as border around the avatar. It will be used as a pattern image color,
   * but It will be scaled to fit the avatar size. If set, the hasBorder initializer value will be ignored,
   * since it's assumed that the client intends to have a custom border.
   */
  customBorderImage?: Image;

  // TODO, disambiguate from ViewProp "style"
  // style: string;

  borderColor?: string;

  /**
   * The avatar view's presence state.
   * The presence state is only shown when the style is set to AvatarStyle.circle.
   */
  presence?: Presence;

  /**
   * When true, the presence status border is opaque. Otherwise, it is transparent.
   */
  usesOpaquePresenceBorder?: boolean;

  // TODO Map the viewProp AccessibilityLabel to this
  // overrideAccessibilityLabel? : string;

  /**
   * Used when avatarView doesn't have image or can't generate initials string
   */
  preferredFallBackImageStyle?: string;

  /**
   * Set to true to enable the pointer interaction on the avatar view, false by default.
   * TODO Figure out how to make iOS only
   */
  hasPointerInteraction?: boolean;

  /**
   * The primary text to create initials with (e.g. a name)
   */
  primaryText?: string;

  /**
   * The secondary text to create initials with if primary text is not provided (e.g. an email address)
   */
  secondaryText?: string;

  /**
   * The image to be displayed
   */
  image?: string;
};

const tokensThatAreAlsoProps: (keyof AvatarTokens)[] = ['size'];

export type NativeAvatarViewProps = ViewProps & AvatarProps & AvatarTokens;

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
    },
    avatarName,
  ],
  tokensThatAreAlsoProps,
  slots: { root: NativeAvatarView },
  slotProps: {
    root: buildProps(
      (tokens) => ({
        size: tokens.size,
        style: { height: tokens.size, width: tokens.size },
      }),
      ['size'],
    ),
  },
  render: (props: NativeAvatarViewProps, useSlots: UseSlots<AvatarType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeAvatarViewProps, children: React.ReactNode) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});
