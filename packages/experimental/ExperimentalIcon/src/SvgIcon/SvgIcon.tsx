import React from 'react';
import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { svgIconName, SvgIconProps } from './SvgIcon.types';
import { useSvgIcon } from './useSvgIcon';

export const SvgIcon = stagedComponent((props: SvgIconProps) => {
  const svgProps = useSvgIcon(props);
  return (final: SvgIconProps) => {
    const { style, height, width, src, uri, viewBox, color, ...rest } = mergeProps<SvgIconProps>(svgProps, final);

    return src || uri ? (
      <View style={style} accessibilityRole="image" {...rest}>
        {src && src({ viewBox, width, height, color })}
        {uri && <SvgUri uri={uri} viewBox={viewBox} width={width} height={height} color={color} />}
      </View>
    ) : null;
  };
});

SvgIcon.displayName = svgIconName;

export default SvgIcon;
