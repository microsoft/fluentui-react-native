import * as React from 'react';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { Text } from 'react-native';
import { fontIconName, FontIconProps } from './FontIcon.types';
import { useFontIcon } from './useFontIcon';

export const FontIcon = stagedComponent((props: FontIconProps) => {
  const fontIconProps = useFontIcon(props);
  return (final: FontIconProps) => {
    const newProps = mergeProps<FontIconProps>(fontIconProps, final);
    const { codepoint, ...rest } = newProps;

    const char = String.fromCharCode(codepoint);
    return <Text {...rest}>{char}</Text>;
  };
});

FontIcon.displayName = fontIconName;

export default FontIcon;
