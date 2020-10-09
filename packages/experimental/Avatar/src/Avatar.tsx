/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Image, NativeModules, ViewProps } from 'react-native';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { getMemoCache } from '@fluentui-react-native/framework';

const cache = getMemoCache();

const avatarName = 'MSFAvatarView';

const NativeAvatarView = ensureNativeComponent(avatarName);

export type Size = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | 'xxLarge';

export type AvatarStyle = 'circle' | 'square';

export type Presence = 'none' | 'available' | 'away' | 'doNotDisturb' | 'outOfOffice' | 'offline' | 'unknown' | 'unknown' | 'blocked';

interface ExportedConstants {
  sizes: { [key in Size]: number };
}

const ExportedNativeConstants: ExportedConstants = NativeModules.MSFAvatarViewManager;

export type AvatarData = {
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
  image?: Image;

  /**
   * The color that represents this avatar.
   * This color will override the initials view's background color.
   * If the avatar view is configured to display a border, this will be the border's color.
   * The colored border will not be displayed if a custom border image is provided.
   */
  color?: string;

  /**
   * Image to be used as border around the avatar. It will be used as a pattern image color,
   * but It will be scaled to fit the avatar size. If set, the hasBorder initializer value will be ignored,
   * since it's assumed that the client intends to have a custom border.
   */
  customBorderImage?: Image;

  /**
   * The avatar view's presence state.
   * The presence state is only shown when the style is set to AvatarStyle.circle.
   */
  presence?: Presence;
};

export type otherAvatarProps = {
  /**
   * Supported Avatar sizes
   */
  size?: Size;

  /**
   * Background Color of initials
   */
  backgroundColor?: string;

  /**
   * Image to be used as border around the avatar. It will be used as a pattern image color,
   * but It will be scaled to fit the avatar size. If set, the hasBorder initializer value will be ignored,
   * since it's assumed that the client intends to have a custom border.
   */
  customBorderImage?: Image;

  /**
   * Shape of the AvatarView
   * Circle is used to represent people
   * Square is used to represent organizations or teams
   */
  avatarStyle?: AvatarStyle;

  /**
   * The color of the border of the avatar view
   */
  borderColor?: string;

  /**
   * When true, the presence status border is opaque. Otherwise, it is transparent.
   */
  usesOpaquePresenceBorder?: boolean;

  // TODO Github#512, Map the viewProp AccessibilityLabel to this
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
};

export type AvatarTokens = {
  /**
   * Supported Avatar sizes
   */
  size?: Size;
};

const tokensThatAreAlsoProps: (keyof AvatarTokens)[] = ['size'];

// The Javascript API is a flat list for all the props we can set on our component
export type AvatarProps = ViewProps & otherAvatarProps & AvatarData;

// The Native component API has a sub object that we flattened out in AvatarProps
export type NativeAvatarViewProps = ViewProps &
  otherAvatarProps & {
    avatarData?: AvatarData;
  };

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

    const cachedAvatarDataProp = cache(
      () => ({
        primaryText: props.primaryText,
        secondaryText: props.secondaryText,
        image: props.image,
        color: props.color,
        customBorderImage: props.customBorderImage,
        presence: props.presence,
      }),
      [props.primaryText, props.secondaryText, props.image, props.color, props.customBorderImage, props.presence],
    )[0];

    return (rest: AvatarProps) => <Root {...mergeProps(props, rest)} avatarData={cachedAvatarDataProp} />;
  },
});
