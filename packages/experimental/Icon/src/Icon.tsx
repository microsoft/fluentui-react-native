import * as React from 'react';
import { IconProps, SvgIconProps, FontIconProps } from './Icon.types';
import { Image, ImageStyle, Platform, View, TextStyle } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { mergeStyles, useFluentTheme } from '@fluentui-react-native/framework';
import { stagedComponent, mergeProps, getMemoCache } from '@fluentui-react-native/framework';
import { SvgUri } from 'react-native-svg';

const rasterImageStyleCache = getMemoCache<ImageStyle>();

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
    [iconProps.color, fontSource.fontSrcFile, fontSource.fontFamily],
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
  const viewBox = iconProps.svgSource.viewBox;
  const style = mergeStyles(iconProps.style, rasterImageStyleCache({ width, height }, [width, height])[0]);

  if (svgIconProps.src) {
    return (
      <View style={style} accessible={accessible} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
        <svgIconProps.src viewBox={viewBox} width={width} height={height} color={color} />
      </View>
    );
  } else if (svgIconProps.uri) {
    return (
      <View style={style} accessible={accessible} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
        <SvgUri uri={svgIconProps.uri} viewBox={viewBox} width={width} height={height} color={color} />
      </View>
    );
  } else {
    return null;
  }
}

export const Icon = stagedComponent((props: IconProps) => {
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
