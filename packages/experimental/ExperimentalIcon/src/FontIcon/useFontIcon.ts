import { TextStyle, Image, Platform } from 'react-native';
import { getMemoCache } from '@fluentui-react-native/framework';
import { FontIconProps } from './FontIcon.types';

export const useFontIcon = (props: FontIconProps): FontIconProps => {
  const { color, fontSrcFile, fontFamily, fontSize, ...rest } = props;

  const style: TextStyle = fontStyleMemoCache(
    { fontFamily: fontSrcFile != undefined ? fontFamilyFromFontSrcFile(fontSrcFile, fontFamily) : fontFamily, fontSize, color },
    [color, fontSize, fontFamily],
  )[0];
  return {
    style,
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
