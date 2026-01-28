import type { TextStyle } from 'react-native';
import { Image, Platform } from 'react-native';

import { getMemoCache, mergeStyles } from '@fluentui-react-native/framework';

import type { FontIconProps } from './FontIcon.types';

export const useFontIcon = (props: FontIconProps): FontIconProps => {
  const { accessible, color, fontSrcFile, fontFamily, fontSize, style: styleOrig, ...rest } = props;

  const style: TextStyle = fontStyleMemoCache(
    { fontFamily: fontSrcFile != undefined ? fontFamilyFromFontSrcFile(fontSrcFile, fontFamily) : fontFamily, fontSize, color },
    [color, fontSize, fontFamily],
  )[0];

  const mergedStyle = mergeStyles<TextStyle>(style, styleOrig);

  return {
    accessible: accessible ?? true,
    style: mergedStyle,
    ...rest,
  };
};

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
