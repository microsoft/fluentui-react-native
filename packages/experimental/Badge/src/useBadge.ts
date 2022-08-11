import { BadgeProps } from './Badge.types';
import { ColorValue } from 'react-native';
import { Theme } from '@fluentui-react-native/framework';

export const useBadge = (props: BadgeProps): BadgeProps => {
  if (!props) return {};
  const { iconPosition = 'before', size = 'medium', ...rest } = props;

  return {
    iconPosition: iconPosition,
    size,
    ...rest,
  };
};

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
