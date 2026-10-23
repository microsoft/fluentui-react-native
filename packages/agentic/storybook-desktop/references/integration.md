---
id: storybook-desktop.integration
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Integrate Storybook Desktop

## App configuration

The application owns its name, root, Storybook package discovery, platform
story exclusions, test-ID prefix, and app-native exceptions. Use
`defineDesktopConfig` from `@fluentui-react-native/desktop-test/config` and
`storybook(...)` from this package's `/config` export. The former
`makeDesktopStorybookConfig` factory and `storybook.config.*` files remain a
compatibility path.

```ts
import { storybook } from '@fluentui-react-native/storybook-desktop/config';
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
    windows: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
  },
  suites: { stories: { kind: 'csf-wdio' } },
  integration: storybook({
    storyPackages: ['@scope/components', ['@scope/native-core', { platforms: ['macos', 'windows'] }]],
  }),
});
```

Native app name, bundle identity, and optional test-ID prefix belong in the
consumer's `app.json`. The config-level `testIDPrefix` is an explicit override.
The consumer app's main entry adapts the integration:

```ts
import config from '../desktop.config.mts';

export default config.integration.configure(config.projectRoot).getStorybookConfig();
```

Use package scripts that forward to the `storybook-desktop` CLI. Keep catalog
configuration in the app's `desktop.config.mts`; do not add duplicate identity
or generated story lists. The app's `src/config` import graph must load before
the TypeScript build; use explicit `.ts` relative imports so
`rewriteRelativeImportExtensions` emits valid `.js` paths.

## Responsibilities

This package owns Storybook-specific CLI lifecycle, static story manifests,
channel orchestration, and CSF callback execution. General target/suite
configuration, WDIO sessions, service ownership, and aggregate reporting are
owned by `@fluentui-react-native/desktop-test`. Runtime bridge and chrome are
owned by `@fluentui-react-native/storybook-desktop-runtime`.

Use the consumer app's agent map for stable app paths and declared entry
commands.
