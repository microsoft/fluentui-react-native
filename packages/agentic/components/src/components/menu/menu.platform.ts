import { Platform } from 'react-native';

export function assertMenuPlatform() {
  if (Platform.OS !== 'macos') {
    throw new Error(`Menu is available only on macOS; ${String(Platform.OS)} Menu admission is gated.`);
  }
}
