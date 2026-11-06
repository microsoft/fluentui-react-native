import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { DesktopAuthority } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver, verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';
import { describeOperations } from '@fluentui-react-native/desktop-driver/operations';
import { connectWithDescriptor } from '@fluentui-react-native/desktop-driver-mcp';
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

const catalog = describeOperations({ accessibilityActions: false, boundedObservation: false });

if (
  typeof createDesktopDriverClient !== 'function' ||
  typeof DesktopAuthority !== 'function' ||
  typeof resolveNativeDesktopDriver !== 'function' ||
  typeof verifyNativeDriverArtifact !== 'function' ||
  catalog.schemaVersion !== 1 ||
  typeof defineDesktopConfig !== 'function' ||
  typeof connectWithDescriptor !== 'function'
) {
  throw new Error('Standalone desktop consumer did not load its declared package APIs.');
}

console.log('standalone-consumer-ok');
