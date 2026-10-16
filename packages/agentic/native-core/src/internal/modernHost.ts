import * as React from 'react';
import { Platform } from 'react-native';

export function assertModernHost(component: string) {
  if (Number.parseInt(React.version, 10) < 19) {
    throw new Error(`Modern ${component} requires React 19. Legacy consumers must use native-core/legacy.`);
  }
  if (Platform.OS !== 'macos' && Platform.OS !== 'windows') {
    throw new Error(`Modern ${component} requires the native-core macOS or Windows registration. Use /legacy on other hosts.`);
  }
}
