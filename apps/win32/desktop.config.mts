import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    win32: {
      host: { kind: 'rex', renderer: 'paper', component: 'FluentTester', windowTitle: 'FluentUI Tester' },
      launchTimeoutMs: 180_000,
      commands: { run: { command: 'yarn', args: ['run-win32'] } },
    },
  },
});
