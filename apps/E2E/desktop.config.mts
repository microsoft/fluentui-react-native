import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';
import { BASE_TESTPAGE } from './src/common/consts.ts';
import { legacyDesktopSpecs } from './desktop-specs.mts';

const runner = {
  kind: 'wdio',
  framework: 'jasmine',
  readiness: { kind: 'native', testId: BASE_TESTPAGE, timeoutMs: 180_000 },
  hooks: './src/common/desktopHooks.ts',
  maxInstances: 1,
  specFileRetries: 1,
  bail: 1,
} as const;

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { use: { config: '../fluent-tester/desktop.config.mts', target: 'macos' } },
    windows: { use: { config: '../fluent-tester/desktop.config.mts', target: 'windows' } },
    win32: { use: { config: '../win32/desktop.config.mts', target: 'win32' } },
  },
  suites: {
    legacy: { ...runner, specs: legacyDesktopSpecs },
    pilot: {
      ...runner,
      specFileRetries: 0,
      specs: {
        macos: [['src/TextLegacy/specs/*.macos.ts']],
        windows: [['src/Pressable/specs/*.win.ts']],
        win32: [['src/Pressable/specs/*.win.ts']],
      },
    },
    'behavioral-pilot': {
      ...runner,
      specFileRetries: 0,
      specs: {
        win32: [
          [
            'src/ButtonV1/specs/*.win.ts',
            'src/CheckboxV1/specs/*.win.ts',
            'src/Switch/specs/*.win.ts',
            'src/FocusZone/specs/FocusZone_Directional.spec.win.ts',
            'src/Callout/specs/*.win.ts',
          ],
        ],
      },
    },
  },
  reporting: { artifactsRoot: './artifacts/desktop' },
});
