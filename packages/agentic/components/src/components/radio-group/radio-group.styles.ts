import { StyleSheet } from 'react-native';
import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import { getNumericStyleValue } from '@fluentui-react-native/design/styling';

export const radioGroupStyles = StyleSheet.create({
  root: { flexDirection: 'column', alignItems: 'flex-start', flexShrink: 1, minWidth: 0 },
  options: { alignItems: 'flex-start', flexShrink: 1, minWidth: 0 },
  vertical: { flexDirection: 'column' },
  horizontal: { flexDirection: 'row' },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
});

export const getRadioGroupThemeStyles = themedStyleSheetFactory('RadioGroup.layout', ({ tokens }) =>
  StyleSheet.create({
    root: { gap: Number(getNumericStyleValue(tokens.spacing.componentBase300)) },
    options: { gap: Number(getNumericStyleValue(tokens.spacing.componentBase100)) },
  }),
);
