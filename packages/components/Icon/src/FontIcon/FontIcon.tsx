import { Text } from 'react-native';

import { mergeProps, directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import type { FontIconProps } from './FontIcon.types';
import { fontIconName } from './FontIcon.types';
import { useFontIcon } from './useFontIcon';

export const FontIcon = phasedComponent((props: FontIconProps) => {
  const fontIconProps = useFontIcon(props);
  return directComponent<FontIconProps>((final: FontIconProps) => {
    const newProps = mergeProps<FontIconProps>(fontIconProps, final);
    const { codepoint, ...rest } = newProps;

    const char = String.fromCharCode(codepoint);
    return <Text {...rest}>{char}</Text>;
  });
});

FontIcon.displayName = fontIconName;

export default FontIcon;
