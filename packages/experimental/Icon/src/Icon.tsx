import * as React from 'react';
import {IIconProps, ISvgIconProps, IFontIconProps} from './Icon.types';
import * as ReactNative from 'react-native';
import { Text } from '@fluentui-react-native/text';
import {SvgUri} from 'react-native-svg'
import * as assetRegistry from 'react-native/Libraries/Image/AssetRegistry';
import { stagedComponent, useTheme, mergeProps, getMemoCache } from '@fluentui-react-native/framework';

function renderRasterImage(iconProps: IIconProps) {
  const { width, height } = iconProps;
  return (
    <ReactNative.Image
      source = {iconProps.rasterImageSource.src}
      style = {{width: width, height: height}}
    />
  )
}

function renderFontIcon(iconProps: IIconProps) {
  const fontSource: IFontIconProps = iconProps.fontSource;
  const style = {...fontSource, color: iconProps.color };

  if (style.fontSrcFile != undefined) {
    const asset = assetRegistry.getAssetByID(style.fontSrcFile);
    style.fontFamily = `${style.fontFamily}#${asset.httpServerLocation}/${asset.name}.${asset.type}`;
  }

  const char = String.fromCharCode(fontSource.codepoint);
  return(
    <Text style={style}>{char}</Text>
  );
}

function renderSvg(iconProps: IIconProps) {
  const svgIconProps: ISvgIconProps = iconProps.svgSource;
  const { width, height } = iconProps;
  const viewBox = iconProps.svgSource.viewBox;

  if (svgIconProps.src) {
    return (
        <svgIconProps.src
          viewBox = {viewBox}
          width = {width}
          height = {height}
          color = {iconProps.color}
        />
    );
  }
  else if (svgIconProps.uri)
  {
    return (
        <SvgUri uri = {svgIconProps.uri}
          viewBox = {viewBox}
          width = {width}
          height = {height}
          color = {iconProps.color}
        />
    )
  }
  else {
    return null;
  }
}

const memoCache = getMemoCache<IIconProps>();

export const Icon = stagedComponent((props: IIconProps) => {
  const theme = useTheme();

  return (rest: IIconProps) => {
    const color = props.color || theme.colors.buttonText;

    const style = memoCache({
      color: color
    }, [color])[0];

    const newProps = mergeProps<IIconProps>(style, props, rest);

    if (newProps.svgSource) {
      return renderSvg(newProps);
    }
    else if (newProps.fontSource) {
      return renderFontIcon(newProps);
    }
    else if (newProps.rasterImageSource) {
      return renderRasterImage(newProps);
    }
    else {
      return null;
    }
  }
});

export default Icon;