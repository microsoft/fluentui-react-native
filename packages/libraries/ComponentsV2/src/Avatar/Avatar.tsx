import * as React from 'react';
import type {
  ColorValue,
  ImageProps,
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';

import { avatarNamedColorTokens, avatarSizeTokens } from './Avatar.tokens';
import type { AvatarColorTokens } from './Avatar.tokens';
import type { AvatarColor, AvatarProps } from './Avatar.types';
import { avatarNamedColors } from './Avatar.types';

const personPath =
  'M10 2C7.79 2 6 3.79 6 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Zm-5 9c-1.1 0-2 .9-2 2 0 3.35 3.13 5 7 5s7-1.65 7-5c0-1.1-.9-2-2-2H5Z';
const avatarColorfulColors = avatarNamedColors.slice(0, avatarNamedColors.indexOf('burgundy'));

export function getAvatarColorHash(value: string): number {
  let hash = 0;
  for (let index = value.length - 1; index >= 0; index--) {
    const character = value.charCodeAt(index);
    const shift = index % 8;
    hash ^= (character << shift) + (character >> (8 - shift));
  }
  return hash;
}

export function getAvatarInitials(name?: string): string {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return Array.from(words[0]).slice(0, 2).join('').toLocaleUpperCase();
  }
  return `${Array.from(words[0])[0] ?? ''}${Array.from(words[words.length - 1])[0] ?? ''}`.toLocaleUpperCase();
}

export function resolveAvatarColorName(idForColor?: string, name?: string): (typeof avatarNamedColors)[number] {
  const hash = getAvatarColorHash(idForColor ?? name ?? '');
  return avatarColorfulColors[hash % avatarColorfulColors.length];
}

function resolveColorTokens(
  color: AvatarColor,
  theme: ReturnType<typeof useFluentTheme>,
  idForColor?: string,
  name?: string,
): AvatarColorTokens {
  if (color === 'neutral') {
    return {
      backgroundColor: theme.colors.neutralBackground6 ?? '#f5f5f5',
      foregroundColor: theme.colors.neutralForeground3 ?? '#616161',
      ringColor: theme.colors.neutralStroke1 ?? '#d1d1d1',
    };
  }
  if (color === 'brand') {
    return {
      backgroundColor: theme.colors.brandBackgroundStatic ?? '#0f6cbd',
      foregroundColor: theme.colors.neutralForegroundOnBrand ?? '#ffffff',
      ringColor: theme.colors.compoundBrandStroke1 ?? '#0f6cbd',
    };
  }
  return avatarNamedColorTokens[color === 'colorful' ? resolveAvatarColorName(idForColor, name) : color];
}

function renderFallback(
  icon: React.ReactNode,
  initials: string,
  foregroundColor: ColorValue,
  fontSize: number,
  iconSize: number,
  testID?: string,
): React.ReactNode {
  if (icon !== undefined && icon !== null) {
    return (
      <View
        accessible={false}
        style={[styles.icon, { height: iconSize, width: iconSize }]}
        testID={testID ? `${testID}-icon` : undefined}
      >
        {icon}
      </View>
    );
  }
  if (initials) {
    return (
      <Text
        accessible={false}
        numberOfLines={1}
        style={[styles.initials, { color: foregroundColor, fontSize, lineHeight: Math.ceil(fontSize * 1.2) }]}
        testID={testID ? `${testID}-initials` : undefined}
      >
        {initials}
      </Text>
    );
  }
  return (
    <Svg
      accessible={false}
      height={iconSize}
      testID={testID ? `${testID}-default-icon` : undefined}
      viewBox="0 0 20 20"
      width={iconSize}
    >
      <Path d={personPath} fill={foregroundColor} />
    </Svg>
  );
}

export const Avatar = React.forwardRef<React.ElementRef<typeof View>, AvatarProps>((props, ref) => {
  const {
    accessibilityLabel,
    accessibilityRole,
    accessible,
    active = 'unset',
    activeAppearance = 'ring',
    badge,
    color = 'neutral',
    idForColor,
    image,
    imageUrl,
    initials: customInitials,
    icon,
    name,
    shape = 'circular',
    size = 32,
    style,
    testID,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const tokens = avatarSizeTokens[size];
  const colors = resolveColorTokens(color, theme, idForColor, name);
  const imageSource = React.useMemo<ImageSourcePropType | undefined>(
    () => image?.source ?? (imageUrl ? { uri: imageUrl } : undefined),
    [image?.source, imageUrl],
  );
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => setImageFailed(false), [imageSource]);

  const initials = customInitials ?? getAvatarInitials(name);
  const showImage = !!imageSource && !imageFailed;
  const showRing = active === 'active' && (activeAppearance === 'ring' || activeAppearance === 'ring-shadow');
  const showShadow = active === 'active' && (activeAppearance === 'shadow' || activeAppearance === 'ring-shadow');
  const outerInset = showRing ? tokens.ringGap + tokens.ringThickness : 0;
  const rootSize = size + outerInset * 2;
  const radius = shape === 'circular' ? size / 2 : tokens.squareRadius;
  const rootRadius = shape === 'circular' ? rootSize / 2 : radius + outerInset;
  const handleImageError: NonNullable<ImageProps['onError']> = event => {
    setImageFailed(true);
    image?.onError?.(event);
  };

  return (
    <View
      {...rest}
      accessibilityLabel={accessibilityLabel ?? name}
      accessibilityRole={accessibilityRole ?? 'image'}
      accessible={accessible ?? true}
      ref={ref}
      style={[
        styles.root,
        {
          borderColor: showRing ? colors.ringColor : 'transparent',
          borderRadius: rootRadius,
          borderWidth: showRing ? tokens.ringThickness : 0,
          height: rootSize,
          padding: showRing ? tokens.ringGap : 0,
          width: rootSize,
        },
        showShadow && styles.shadow,
        style as StyleProp<ViewStyle>,
      ]}
      testID={testID}
    >
      <View
        accessible={false}
        style={[
          styles.content,
          {
            backgroundColor: colors.backgroundColor,
            borderRadius: radius,
            height: size,
            opacity: active === 'inactive' ? 0.55 : 1,
            transform: active === 'inactive' ? [{ scale: 0.8 }] : undefined,
            width: size,
          },
        ]}
      >
        {showImage ? (
          <Image
            {...image}
            accessible={false}
            onError={handleImageError}
            source={imageSource as ImageSourcePropType}
            style={[styles.image, { borderRadius: radius }, image?.style]}
            testID={testID ? `${testID}-image` : undefined}
          />
        ) : (
          renderFallback(icon, initials, colors.foregroundColor, tokens.fontSize, tokens.iconSize, testID)
        )}
      </View>
      {badge && active === 'unset' ? (
        <View
          accessible={false}
          pointerEvents="box-none"
          style={[
            styles.badge,
            {
              bottom: showRing ? tokens.ringGap : 0,
              minHeight: tokens.badgeSize,
              minWidth: tokens.badgeSize,
              right: showRing ? tokens.ringGap : 0,
            },
          ]}
          testID={testID ? `${testID}-badge` : undefined}
        >
          {badge}
        </View>
      ) : null}
    </View>
  );
});

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  initials: {
    fontFamily: 'Segoe UI',
    fontWeight: '600',
    maxWidth: '90%',
    textAlign: 'center',
  } satisfies TextStyle,
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
  },
});
