import { ColorValue } from 'react-native';

export type ColorSetOptions = {
  /** rest or default color value */
  rest: ColorValue;
  /** hover color value */
  hover?: ColorValue;
  /** pressed color value */
  pressed?: ColorValue;
  /** indicates if the color set is deep, meaning interactions should be inverted */
  deep?: boolean;
};

export type BaseColorSet = {
  readonly rest: ColorValue;
  readonly hover: ColorValue;
  readonly pressed: ColorValue;
};
