import { AvatarProps, AvatarInfo, AvatarState, AvatarColors } from './Avatar.types';
import { PresenceBadgeProps } from '@fluentui-react-native/badge';
import { titles } from './titles';
import { getHashCodeWeb } from './getHashCode';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
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
    initials,
    name,
    shape,
    transparentRing,
    icon,
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

  const _initials = initials || getInitials(name);
  const avatarColorsIdx = getHashCodeWeb(idForColor ?? name ?? '') % AvatarColors.length;
  const _avatarColor = avatarColor === 'colorful' ? AvatarColors[avatarColorsIdx] : avatarColor;

  const iconProps = createIconProps(icon);

  return {
    props: {
      accessible: true,
      accessibilityLabel: accessibilityLabel || accessibilityText,
      accessibilityRole: accessibilityRole ?? 'image',
      active,
      activeAppearance,
      avatarColor: _avatarColor,
      badge: badgeProps,
      badgeStatus: badge?.status,
      initials: _initials,
      icon: iconProps,
      outOfOffice: badge?.outOfOffice,
      shape: shape ?? 'circular',
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
  const WORDS_IN_BRACES_REGEXP = new RegExp('[(\\[\\{][^\\)\\]\\}]*[\\)\\]\\}]', 'g');
  const PHONE_NUMBER_REGEXP = new RegExp('(\\+|(\\d|\\s))', 'g');
  const SPECIAL_CHARACTERS_REGEXP = new RegExp('[!"#\'$%&*+,-./:;>=<?@^_`|~¡¢£¤¥¦§¨©ª«¬®ˉ°±²¼½¾¿×÷]', 'g');
  const words = name
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
