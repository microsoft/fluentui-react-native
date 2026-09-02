import { StyleSheet } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';

export const getTextStyles = themedStyleSheetFactory('Text.styles', ({ tokens }) =>
  StyleSheet.create({
    root: {
      color: tokens.color.foregroundNeutralPrimary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodyMedium,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodyMedium,
    },
  }),
);
