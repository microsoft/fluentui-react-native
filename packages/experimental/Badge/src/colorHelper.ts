import { ColorValue } from 'react-native';
import { Theme } from '@fluentui-react-native/framework';

export type BadgeColors = {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  iconColor?: ColorValue;
  borderColor?: ColorValue;
  backgroundColorDark?: ColorValue;
  colorDark?: ColorValue;
  borderColorDark?: ColorValue;
  hcBackground?: ColorValue;
  hcColor?: ColorValue;
  hcBorderColor?: ColorValue;
};

export function getHCProps(theme: Theme, colors?: BadgeColors) {
  const hcColors = colors || {};
  const hcBackground = hcColors.hcBackground || theme.colors.transparentBackground;
  const hcColor = hcColors.hcColor || theme.colors.neutralForeground3;
  const hcBorderColor = hcColors.hcBorderColor || theme.colors.neutralForeground3;

  return {
    backgroundColor: hcBackground,
    color: hcColor,
    iconColor: hcColor,
    borderColor: hcBorderColor,
  };
}
