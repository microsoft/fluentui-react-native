import { JSAvatarProps, AvatarInfo, JSAvatarState, AvatarColors } from './JSAvatar.types';
import { ImageProps, ImageSourcePropType } from 'react-native';
import { PresenceBadgeProps } from '@fluentui-react-native/badge';
import { titles } from './titles';
/**
 * Re-usable hook for FURN Avatar.
 * This hook configures Avatar props and state for FURN Avatar.
 *
 * @param props user props sent to FURN Avatar
 * @returns configured props and state for FURN Avatar
 */
export const useAvatar = (props: JSAvatarProps): AvatarInfo => {
  const { avatarColor, active, accessibilityLabel, activeAppearance, badge, idForColor, initials, name, src, ring, shape, ...rest } = props;

  const showRing = active === 'active' && activeAppearance === 'ring';
  const transparentRing = !!ring?.transparent;
  const showBadge = (!active || active === 'unset') && !!badge && !!badge.status;

  const imageProps: ImageProps = {
    accessibilityLabel,
    source: src ? ({ uri: src } as ImageSourcePropType) : undefined,
  };

  const badgeProps: PresenceBadgeProps = {
    size: 'small',
    ...badge,
  };

  const state: JSAvatarState = {
    showRing,
    transparentRing,
    showBadge,
  };

  const _initials = initials || getInitials(name);
  const avatarColorsIdx = getHashCode(idForColor ?? name ?? '') % AvatarColors.length;
  const _avatarColor = avatarColor === 'colorful' ? AvatarColors[avatarColorsIdx] : avatarColor;

  return {
    props: {
      avatarColor: _avatarColor,
      shape: shape || 'circular',
      ...rest,
      active,
      activeAppearance,
      image: imageProps,
      badge: badgeProps,
      initials: _initials,
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
  if (!name && !validateAlphabeticalCharacters(name)) {
    return '';
  }
  const nonWordRegExp = new RegExp('\\W+(?<!\\S-)', 'g');
  const wordsInBracesRegExp = new RegExp('(\\(|\\[|\\{)\\w+(\\)|\\]|\\})', 'g');
  let words = name.replace(wordsInBracesRegExp, ' ').replace(nonWordRegExp, ' ').trim().split(' ');
  words = removeTitlesFromName(words);
  const wordsLength = words.length;
  const lastWordIdx = wordsLength - 1;
  const initials = `${words[0].charAt(0).toUpperCase()}${wordsLength > 1 ? words[lastWordIdx].charAt(0).toUpperCase() : ''}`;
  return initials;
};

/**
 * A function which verifies whether a name contains non-alphabetical characters
 *
 * @param name
 * @returns true if the name contains alphabetical characters. Returns false if there are
 * numeric values or the first character is non-alphabetical. In this case avatar should
 * fall back to icon.
 */
export const validateAlphabeticalCharacters = (name: string): boolean => {
  const alphabeticalRegExp = new RegExp('[a-zA-Z]', 'g');
  return name ? alphabeticalRegExp.test(name) : false;
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
 * A function which returns hash code for the avatar color
 *
 * @param str is idForColor or name
 * @returns hash code of the color
 */
const getHashCode = (str: string): number => {
  let hashCode = 0;
  for (let len: number = str.length - 1; len >= 0; len--) {
    const ch = str.charCodeAt(len);
    const shift = len % 8;
    hashCode ^= (ch << shift) + (ch >> (8 - shift)); // eslint-disable-line no-bitwise
  }

  return hashCode;
};
