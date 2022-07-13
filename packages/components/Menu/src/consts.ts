import { Platform } from 'react-native';

export const hoverDelayDefault = Platform.select({
  macos: 100,
  default: 500, // win32
});

export const isCloseOnHoverOutEnabled = Platform.OS === ('win32' as any);
