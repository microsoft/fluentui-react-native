import { ColorValue } from '@fluentui-react-native/theme-types';
import { PlatformColor } from 'react-native';

/** Palette of Apple Platform Colors, defined at https://developer.apple.com/documentation/uikit/uicolor/ui_element_colors */
export interface AppleSemanticPalette {
  /* Label Colors */

  /** The primary color to use for text labels */
  label: ColorValue;

  /** The secondary color to use for text labels */
  secondaryLabel: ColorValue;

  /** The tertiary color to use for text labels */
  tertiaryLabel: ColorValue;

  /** The quaternary color to use for text labels and separators */
  quaternaryLabel: ColorValue;

  /* Fill Colors */

  /** An overlay fill color for thin and small shapes */
  systemFill: ColorValue;

  /** An overlay fill color for medium-size shapes */
  secondarySystemFill: ColorValue;

  /** An overlay fill color for large shapes */
  tertiarySystemFill: ColorValue;

  /** An overlay fill color for large areas that contain complex content */
  quaternarySystemFill: ColorValue;

  /* Text Colors */

  /** The color for placeholder text in controls or text views */
  placeholderText: ColorValue;

  /* Standard Content Background Colors */
  // Use these colors for standard table views and designs that have a white primary background in a light environment.

  /** The color for the main background of your interface */
  systemBackground: ColorValue;

  /** The color for content layered on top of the main background */
  secondarySystemBackground: ColorValue;

  /** The color for content layered on top of secondary backgrounds */
  tertiarySystemBackground: ColorValue;

  /* Grouped Content Background Colors */
  // Use these colors for grouped content, including table views and platter-based designs.

  /** The color for the main background of your interface */
  systemGroupedBackground: ColorValue;

  /** The color for content layered on top of the main background */
  secondarySystemGroupedBackground: ColorValue;

  /** The color for content layered on top of secondary backgrounds */
  tertiarySystemGroupedBackground: ColorValue;

  /* Separator Colors */

  /** The color for thin borders or divider lines that allows some underlying content to be visible */
  separator: ColorValue;

  /** The color for borders or divider lines that hides any underlying content */
  opaqueSeparator: ColorValue;

  /* Link Color */

  /** The color for links */
  link: ColorValue;

  /* Non-adaptable Colors */

  /** The non-adaptable system color for text on a light background */
  darkText: ColorValue;

  /** The non-adaptable system color for text on a dark background */
  lightText: ColorValue;
}

export function getAppleSemanticPalette(): AppleSemanticPalette {
  return {
    label: PlatformColor('label'),
    secondaryLabel: PlatformColor('secondaryLabel'),
    tertiaryLabel: PlatformColor('tertiaryLabel'),
    quaternaryLabel: PlatformColor('quaternaryLabel'),

    systemFill: PlatformColor('systemFill'),
    secondarySystemFill: PlatformColor('secondarySystemFill'),
    tertiarySystemFill: PlatformColor('tertiarySystemFill'),
    quaternarySystemFill: PlatformColor('quaternarySystemFill'),

    placeholderText: PlatformColor('placeholderText'),

    systemBackground: PlatformColor('systemBackground'),
    secondarySystemBackground: PlatformColor('secondarySystemBackground'),
    tertiarySystemBackground: PlatformColor('tertiarySystemBackground'),

    systemGroupedBackground: PlatformColor('systemGroupedBackground'),
    secondarySystemGroupedBackground: PlatformColor('secondarySystemGroupedBackground'),
    tertiarySystemGroupedBackground: PlatformColor('tertiarySystemGroupedBackground'),

    separator: PlatformColor('separator'),
    opaqueSeparator: PlatformColor('opaqueSeparator'),

    link: PlatformColor('link'),

    darkText: PlatformColor('darkText'),
    lightText: PlatformColor('lightText'),
  };
}
