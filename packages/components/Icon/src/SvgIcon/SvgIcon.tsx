import { Platform, View } from 'react-native';

import { mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';
import { SvgUri } from 'react-native-svg';

import type { SvgIconProps } from './SvgIcon.types';
import { svgIconName } from './SvgIcon.types';
import { useSvgIcon } from './useSvgIcon';

export const SvgIcon = phasedComponent((props: SvgIconProps) => {
  const svgProps = useSvgIcon(props);
  return (final: SvgIconProps) => {
    const { style, height, width, src, uri, viewBox, color, ...rest } = mergeProps<SvgIconProps>(svgProps, final);
    const svgIconsSupported = Platform.OS !== 'windows';

    return svgIconsSupported && (src || uri) ? (
      <View style={style} accessibilityRole="image" {...rest}>
        {src ? (
          <svgProps.src viewBox={viewBox} width={width} height={height} color={color} />
        ) : (
          <SvgUri uri={uri} viewBox={viewBox} width={width} height={height} color={color} />
        )}
      </View>
    ) : null;
  };
});

SvgIcon.displayName = svgIconName;

export default SvgIcon;
