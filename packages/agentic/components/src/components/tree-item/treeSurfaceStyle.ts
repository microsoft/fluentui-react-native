import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

export function treeSurfaceStyle<T extends Pick<ViewStyle, 'backgroundColor'>>(style: T): T {
  const color = style.backgroundColor;
  // The REX view host paints eight-digit zero-alpha RGB tokens as opaque.
  return String(Platform.OS) === 'win32' && typeof color === 'string' && color[0] === '#' && color.length === 9 && color.endsWith('00')
    ? { ...style, backgroundColor: undefined }
    : style;
}
