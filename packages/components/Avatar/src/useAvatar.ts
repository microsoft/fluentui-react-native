import { ImageProps, ImageSourcePropType } from 'react-native';
import { AvatarProps, AvatarInfo, AvatarState, AvatarColors, AvatarSize, AvatarColor } from './Avatar.types';
import { PresenceBadgeProps } from '@fluentui-react-native/badge';
import { titles, multiWordTitles } from './titles';
import { getHashCodeWeb } from './getHashCode';
import { createIconProps } from '@fluentui-react-native/icon';

/**
 * Re-usable hook for FURN Avatar.
 * This hook configures Avatar props and state for FURN Avatar.
 *
 * @param props user props sent to FURN Avatar
 * @returns configured props and state for FURN Avatar
 */
export const useAvatar = (props: AvatarProps): AvatarInfo => {
  const {
    avatarColor,
    active,
    accessibilityLabel,
    accessibilityRole,
    activeAppearance,
    badge,
    idForColor,
    image,
    imageUrl,
    initials,
    name,
    shape,
    transparentRing,
    icon,
    size,
    ...rest
  } = props;

  const showRing = active === 'active' && activeAppearance === 'ring';
  const showBadge = (!active || active === 'unset') && !!badge && !!badge.status;
  const accessibilityText = `${name || ''}${showBadge ? `, ${badge.status}` : ''}`;

  const badgeProps: PresenceBadgeProps = {
    size: 'small',
    ...badge,
  };

  const state: AvatarState = {
    showRing,
    transparentRing: !!transparentRing,
    showBadge,
  };

  let imageProps: ImageProps = {
    accessibilityLabel,
    source: imageUrl ? ({ uri: imageUrl } as ImageSourcePropType) : undefined,
  };

  if (image && image.source) {
    imageProps = {
      ...image,
      accessibilityLabel: image.accessibilityLabel ?? accessibilityLabel,
    };
  }

  let iconProps = createIconProps(icon);
  const isFontIcon = !!(iconProps && iconProps.fontSource);
  if (isFontIcon) {
    const { fontSource, ...restIconProps } = iconProps;

    iconProps = {
      fontSource: {
        fontSize: fontSource.fontSize ?? getFontIconSize(size),
        ...iconProps.fontSource,
      },
      ...restIconProps,
    };
  }

  return {
    props: {
      accessible: true,
      accessibilityLabel: accessibilityLabel || accessibilityText,
      accessibilityRole: accessibilityRole ?? 'image',
      active,
      activeAppearance,
      avatarColor: avatarColor === 'colorful' ? resolveColorfulToSpecificColor(idForColor, name) : avatarColor,
      badge: badgeProps,
      badgeStatus: badge?.status,
      initials: initials || getInitials(name),
      icon: iconProps,
      image: imageProps,
      outOfOffice: badge?.outOfOffice,
      shape: shape ?? 'circular',
      size,
      ...rest,
    },
    state: {
      ...state,
    },
  };
};

/**
 * A function which takes a name and returns initials
 *
 * @param name
 * @returns initials. First letter of the word if only one word was provided.
 * First letters of the first and last words if more words were provided.
 * Words in braces, titles, special characters, parantheses and dashes should be ignored.
 */
export const getInitials = (name: string): string => {
  if (!name) {
    return '';
  }
  const ARABIC_ASIAN_REGEXP = new RegExp(
    '[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uD840-\uD869]',
    'g',
  );
  const words = removeRedundantCharacters(name);
  const wordsLength = words.length;

  if (!wordsLength) {
    return '';
  }

  const lastWordIdx = wordsLength - 1;
  const firstLetter = words[0].charAt(0).toUpperCase();
  const lastLetter = wordsLength > 1 ? words[lastWordIdx].charAt(0).toUpperCase() : '';
  const initials = `${firstLetter}${ARABIC_ASIAN_REGEXP.test(name) ? '' : lastLetter}`;
  return initials;
};

/**
 * A function which takes a name and returns array of valid words
 *
 * @param name
 * @returns array of words without phone numbers and special characters.
 */
export const removeRedundantCharacters = (name: string): string[] => {
  if (!name) {
    return [];
  }

  const MAX_NAME_LENGTH = 100;
  let _name = name.length > MAX_NAME_LENGTH ? name.trim().substring(0, MAX_NAME_LENGTH) : name;
  _name = isMultiWordName(_name) ? removeMultiWordTitles(_name) : _name;

  const WORDS_IN_BRACES_REGEXP = new RegExp('[(\\[\\{][^\\)\\]\\}]*[\\)\\]\\}]', 'g');
  const PHONE_NUMBER_REGEXP = new RegExp('(\\+|(\\d|\\s))', 'g');
  const SPECIAL_CHARACTERS_REGEXP = new RegExp('[!"#\'$%&*+,-./:;>=<?@^_`|~¡¢£¤¥¦§¨©ª«¬®ˉ°±²¼½¾¿×÷]', 'g');
  const words = _name
    .replace(WORDS_IN_BRACES_REGEXP, '')
    .replace(PHONE_NUMBER_REGEXP, ' ')
    .replace(SPECIAL_CHARACTERS_REGEXP, '')
    .trim()
    .split(' ');
  return removeTitlesFromName(words);
};

/**
 * A function which verifies whether words array contains title
 *
 * @param words array of words in name
 * @returns array of words without titles
 */
export const removeTitlesFromName = (words: string[]): string[] => {
  return words.filter((word) => !titles.has(word));
};

/**
 * A function which verifies whether words array contains multi-word title
 *
 * @param name
 * @returns name without multi-word titles
 */
const removeMultiWordTitles = (name: string): string => {
  for (const idx in multiWordTitles) {
    const title = multiWordTitles[idx];

    if (name.indexOf(title) !== -1) {
      return name.replace(title, '');
    }
  }
  return name;
};

/**
 * A function which verifies whether name contains more than one word
 *
 * @param name
 * @returns true if name is multi-word
 */
const isMultiWordName = (name: string): boolean => {
  return name.search(' ') !== -1;
};

function getFontIconSize(size: AvatarSize) {
  if (size >= 25 && size <= 47) {
    return 20;
  } else if (size === 48) {
    return 24;
  } else if (size === 56) {
    return 28;
  } else if (size >= 57 && size <= 72) {
    return 32;
  } else if (size >= 73) {
    return 48;
  }
  return 16;
}

/**
 * A function that determines the actual color to be used for the avatar background when the avatarColor token is 'colorful'
 *
 * @param idForColor string to be used instead of the name, to determine which color to use when color="colorful"
 * @param name name of the person or entity represented by this Avatar
 * @returns color to be used when the avatarColor token is set to 'colorful'
 */
export const resolveColorfulToSpecificColor = (idForColor: string, name: string): AvatarColor => {
  const adjustedNumberOfAvatarColors = AvatarColors.length - 3;
  return AvatarColors[getHashCodeWeb(idForColor ?? name ?? '') % adjustedNumberOfAvatarColors];
};
