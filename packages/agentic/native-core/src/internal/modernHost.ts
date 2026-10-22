import * as React from 'react';
import { Platform, UIManager } from 'react-native';

function assertReact19(component: string) {
  if (Number.parseInt(React.version, 10) < 19) {
    throw new Error(`Modern ${component} requires React 19. Legacy consumers must use native-core/legacy.`);
  }
}

export function assertModernHost(component: string) {
  assertReact19(component);
  if (Platform.OS !== 'macos' && Platform.OS !== 'windows') {
    throw new Error(`Modern ${component} requires the native-core macOS or Windows registration. Use /legacy on other hosts.`);
  }
}

/** The Win32 adapters compose the Office host's own legacy registrations; native-core registers nothing there. */
export function assertWin32Host(component: string, viewManager: string) {
  assertReact19(component);
  if (String(Platform.OS) !== 'win32') {
    throw new Error(`The Win32 ${component} adapter requires the Office Win32 host. Use /macos or /windows on those hosts.`);
  }
  if (!UIManager.getViewManagerConfig(viewManager)) {
    throw new Error(`The Win32 ${component} adapter requires the host's ${viewManager} registration.`);
  }
}
