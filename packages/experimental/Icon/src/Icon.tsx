import * as React from 'react';
import { IconProps, SvgIconProps, FontIconProps } from './Icon.types';
import { Image, ImageStyle, Platform, View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { SvgUri } from 'react-native-svg';
import { mergeStyles } from '@fluentui-react-native/framework';
import { stagedComponent, mergeProps, getMemoCache } from '@fluentui-react-native/framework';
import { useTheme } from '@fluentui-react-native/theme-types';

const rasterImageStyleCache = getMemoCache<ImageStyle>();

function renderRasterImage(iconProps: IconProps) {
  const { width, height } = iconProps;
  const style = mergeStyles(iconProps.style, rasterImageStyleCache({ width: width, height: height }, [width, height])[0]);

  return <Image source={iconProps.rasterImageSource.src} style={style} />;
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

  const style = fontStyleMemoCache(
    {
      fontSrcFile: fontSource.fontSrcFile,
      fontFamily:
        fontSource.fontSrcFile != undefined
          ? fontFamilyFromFontSrcFile(fontSource.fontSrcFile, fontSource.fontFamily)
          : fontSource.fontFamily,
      codepoint: fontSource.codepoint,
      fontSize: fontSource.fontSize,
      color: iconProps.iconColor,
    },
    [iconProps.iconColor, fontSource.fontSrcFile, fontSource.fontFamily, fontSource.codepoint, fontSource.codepoint],
  )[0];

  const char = String.fromCharCode(fontSource.codepoint);
  return <Text style={style}>{char}</Text>;
}

function renderSvg(iconProps: IconProps) {
  const svgIconProps: SvgIconProps = iconProps.svgSource;
  const { width, height } = iconProps;
  const viewBox = iconProps.svgSource.viewBox;
  const style = mergeStyles(iconProps.style, rasterImageStyleCache({ width: width, height: height }, [width, height])[0]);

  if (svgIconProps.src) {
    return (
      <View style={style}>
        <svgIconProps.src viewBox={viewBox} width={width} height={height} color={iconProps.iconColor} />
      </View>
    );
  } else if (svgIconProps.uri) {
    return (
      <View style={style}>
        <SvgUri uri={svgIconProps.uri} viewBox={viewBox} width={width} height={height} color={iconProps.iconColor} />
      </View>
    );
  } else {
    return null;
  }
}

export const Icon = stagedComponent((props: IconProps) => {
  const theme = useTheme();

  return (rest: IconProps) => {
    const color = props.iconColor || theme.colors.buttonContent;

    const baseProps = {
      iconColor: color,
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
