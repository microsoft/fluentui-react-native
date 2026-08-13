/** @jsxImportSource @fluentui-react-native/framework-base */
import { Image, Text } from 'react-native';
import type { ImageStyle, TextStyle } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import type { IconElementProps, IconProps } from './icon.types';

function getFontSize(height: number | undefined, width: number | undefined): number | undefined {
  if (height !== undefined && width !== undefined) {
    return Math.min(height, width);
  }

  return height ?? width;
}

/**
 * Renders an image, font glyph, or SVG component without adding a component boundary.
 */
export const Icon = directComponent<IconProps>(({ color, fontSource, height, imageSource, svgSource, width, ...rest }) => {
  const accessibilityRole = rest.accessibilityRole ?? 'image';

  if (svgSource) {
    const SvgIcon = svgSource;
    const svgProps: IconElementProps = { ...rest, accessibilityRole, color, height, width };
    return <SvgIcon {...svgProps} />;
  }

  if (fontSource) {
    const fontSize = getFontSize(height, width);
    const style: TextStyle = {
      color,
      fontFamily: fontSource.fontFamily,
      fontSize,
      height,
      lineHeight: height ?? fontSize,
      padding: 0,
      textAlign: 'center',
      textAlignVertical: 'center',
      width,
    };

    return (
      <Text {...rest} accessibilityRole={accessibilityRole} style={style}>
        {String.fromCodePoint(fontSource.codepoint)}
      </Text>
    );
  }

  if (imageSource) {
    const style: ImageStyle = { height, tintColor: color, width };
    return <Image {...rest} accessibilityRole={accessibilityRole} source={imageSource} style={style} />;
  }

  return <></>;
});

Icon.displayName = 'Icon';
