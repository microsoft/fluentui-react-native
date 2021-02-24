import { Typography } from '@fluentui-react-native/theme-types';
import { NativeModules } from 'react-native';

/**
 * The Typography is designed to match the styles defined in the Apple HIG:
 * https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/typography/
 * These mappings and variants are subject to change as we moved to a unified cross platform Fluent typography ramp
 */

const { MSFAppleThemeModule } = NativeModules;

const { macosTypography, macosPalette } = MSFAppleThemeModule.getConstants();
console.warn('Look at: ' + macosTypography.families.primary);
console.warn('SAAD background: ' + String(macosPalette));

export function appleTypography(): Typography {
  return macosTypography;
}
