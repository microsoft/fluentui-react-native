import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

const metroPort = 8081;
// Hosted runners set the installed SDK (the Windows Server 2025 image ships only 10.0.26100.0).
const windowsSdkVersion = process.env.WindowsTargetPlatformVersion || '10.0.22621.0';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app', renderer: 'fabric' }, launchTimeoutMs: 180_000 },
    windows: {
      // Windows uses the app displayName, not the component displayName used by macOS.
      host: { kind: 'react-native-test-app', renderer: 'fabric', application: { windowTitle: 'FluentTester' } },
      launchTimeoutMs: 180_000,
      commands: {
        // The default build stage does not register the package that the harness launches by AUMID.
        build: [
          {
            command: 'yarn',
            args: [
              'windows',
              '--no-deploy',
              '--no-launch',
              '--no-packager',
              // One SDK for the whole solution; RNSVG otherwise chooses the newest SDK and its WinMD is rejected by the RN Test App.
              '--msbuildprops',
              `WindowsTargetPlatformVersion=${windowsSdkVersion}`,
            ],
          },
          { command: 'pwsh', args: ['-NoProfile', '-File', 'scripts/register-windows-app.ps1'] },
        ],
      },
      // Debug builds of the RN Test App load their JavaScript from Metro.
      services: [
        {
          id: 'metro',
          command: { command: 'yarn', args: ['exec', 'rnx-cli', 'start', '--no-interactive', '--port', String(metroPort)] },
          // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- React Native Test App connects to loopback Metro
          readyUrl: `http://127.0.0.1:${metroPort}/status`,
        },
      ],
    },
  },
});
