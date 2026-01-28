import { Image, Platform, View } from 'react-native';
import type { ImageStyle, TextStyle } from 'react-native';

import { mergeStyles, useFluentTheme } from '@fluentui-react-native/framework';
import { phasedComponent, mergeProps, getMemoCache, getTypedMemoCache } from '@fluentui-react-native/framework-base';
import { Text } from '@fluentui-react-native/text';
import type { SvgProps } from 'react-native-svg';
import { SvgUri } from 'react-native-svg';

import type { IconProps, SvgIconProps, FontIconProps } from './Icon.types';

const rasterImageStyleCache = getTypedMemoCache<ImageStyle>();

function renderRasterImage(iconProps: IconProps) {
  const { width, height, color } = iconProps;
  const style = mergeStyles(
    iconProps.style,
    rasterImageStyleCache({ width: width, height: height, tintColor: color }, [width, height, color])[0],
  );

  return (
    <Image
      source={iconProps.rasterImageSource.src}
      style={style}
      accessible={iconProps.accessible}
      accessibilityRole="image"
      accessibilityLabel={iconProps.accessibilityLabel}
    />
  );
}

function fontFamilyFromFontSrcFile(fontSrcFile: string, fontFamily: string): string {
  if (Platform.OS == 'windows') {
    // This `${family}#${path}` notation is specific to WPF
    const asset = Image.resolveAssetSource(+fontSrcFile);
    return `${fontFamily}#${asset.uri}`;
  } else {
    return fontFamily;
  }
}

const fontStyleMemoCache = getMemoCache();

function renderFontIcon(iconProps: IconProps) {
  const fontSource: FontIconProps = iconProps.fontSource;

  const style: TextStyle = fontStyleMemoCache(
    {
      fontSrcFile: fontSource.fontSrcFile,
      fontFamily:
        fontSource.fontSrcFile != undefined
          ? fontFamilyFromFontSrcFile(fontSource.fontSrcFile, fontSource.fontFamily)
          : fontSource.fontFamily,
      fontSize: fontSource.fontSize,
      color: iconProps.color,
    },
    [iconProps.color, fontSource.fontSrcFile, fontSource.fontFamily, fontSource.fontSize],
  )[0];

  const char = String.fromCharCode(fontSource.codepoint);
  return (
    <Text accessible={iconProps.accessible} style={style}>
      {char}
    </Text>
  );
}

function renderSvg(iconProps: IconProps) {
  const svgIconProps: SvgIconProps = iconProps.svgSource;
  const { accessible, accessibilityLabel, width, height, color } = iconProps;
  const style = mergeStyles(iconProps.style, rasterImageStyleCache({ width, height }, [width, height])[0]);

  const svgProps: SvgProps = { width, height, color };
  if (svgIconProps.viewBox) {
    svgProps.viewBox = svgIconProps.viewBox;
  }

  if (svgIconProps.src) {
    return (
      <View style={style} accessible={accessible} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
        <svgIconProps.src {...svgProps} />
      </View>
    );
  } else if (svgIconProps.uri) {
    return (
      <View style={style} accessible={accessible} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
        <SvgUri uri={svgIconProps.uri} {...svgProps} />
      </View>
    );
  } else {
    return null;
  }
}

export const Icon = phasedComponent((props: IconProps) => {
  const theme = useFluentTheme();

  return (rest: IconProps) => {
    const color = props.color || theme.colors.buttonText;
    const accessible = props.accessible ?? true;

    const baseProps: IconProps = {
      color: color,
      accessible,
    };

    const newProps = mergeProps<IconProps>(baseProps, props, rest);

    if (newProps.svgSource) {
      return renderSvg(newProps);
    } else if (newProps.fontSource) {
      return renderFontIcon(newProps);
    } else if (newProps.rasterImageSource) {
      return renderRasterImage(newProps);
    } else {
      return null;
    }
  };
});

export default Icon;
