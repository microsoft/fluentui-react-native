import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { DesktopAuthority } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver, verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';
import { describeOperations } from '@fluentui-react-native/desktop-driver/operations';
import { connectWithDescriptor } from '@fluentui-react-native/desktop-driver-mcp';
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';
import { startDesktopService, startNativeDesktopService } from '@fluentui-react-native/desktop-test/driver-service';

const catalog = describeOperations({ accessibilityActions: false, boundedObservation: false });

// Every public library entry loads on its own, without Storybook or a running WDIO session.
const entries = {
  '.': await import('@fluentui-react-native/desktop-test'),
  './config': await import('@fluentui-react-native/desktop-test/config'),
  './reporting': await import('@fluentui-react-native/desktop-test/reporting'),
  './reporting/run-queries': await import('@fluentui-react-native/desktop-test/reporting/run-queries'),
  './commands': await import('@fluentui-react-native/desktop-test/commands'),
  './driver-service': await import('@fluentui-react-native/desktop-test/driver-service'),
  './process-control': await import('@fluentui-react-native/desktop-test/process-control'),
  './resources': await import('@fluentui-react-native/desktop-test/resources'),
  './ownership': await import('@fluentui-react-native/desktop-test/ownership'),
  './jasmine': await import('@fluentui-react-native/desktop-test/jasmine'),
  './wdio': await import('@fluentui-react-native/desktop-test/wdio'),
};
const empty = Object.entries(entries).filter(([, module]) => Object.keys(module).length === 0);
if (empty.length) throw new Error(`Public desktop-test entries exported nothing: ${empty.map(([entry]) => entry).join(', ')}`);

if (
  typeof createDesktopDriverClient !== 'function' ||
  typeof DesktopAuthority !== 'function' ||
  typeof resolveNativeDesktopDriver !== 'function' ||
  typeof verifyNativeDriverArtifact !== 'function' ||
  catalog.schemaVersion !== 1 ||
  typeof defineDesktopConfig !== 'function' ||
  typeof startDesktopService !== 'function' ||
  typeof startNativeDesktopService !== 'function' ||
  typeof connectWithDescriptor !== 'function'
) {
  throw new Error('Standalone desktop consumer did not load its declared package APIs.');
}

console.log('standalone-consumer-ok');
