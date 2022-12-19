import { Platform } from 'react-native';

export const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';
export const isDesktop = Platform.OS === 'macos' || Platform.OS === 'windows' || Platform.OS === ('win32' as any);
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isMac = Platform.OS === 'macos';
export const isWin32 = Platform.OS === ('win32' as any);
export const isWindows = Platform.OS === 'windows';
