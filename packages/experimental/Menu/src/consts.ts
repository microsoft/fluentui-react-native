import { Platform } from 'react-native';

export const delayHover = Platform.select({
  macos: 100,
  default: 500, // win32
});

export const isCloseOnHoverOutEnabled = true;
