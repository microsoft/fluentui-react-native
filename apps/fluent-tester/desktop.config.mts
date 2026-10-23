import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app', renderer: 'fabric' }, launchTimeoutMs: 180_000 },
    windows: { host: { kind: 'react-native-test-app', renderer: 'fabric' }, launchTimeoutMs: 180_000 },
  },
});
