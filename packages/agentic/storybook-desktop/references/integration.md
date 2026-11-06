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

### Exact callback selection

`wdio.testCases` accepts a nonempty array of unique
`{ storyId, testName }` pairs. It intersects the existing story, tag, and test
filters and is applied consistently to static `test --list` discovery and
callback execution, including grouped smoke. Omitted selections preserve the
existing behavior; legacy single callbacks use the name `default`. Declared
pairs that do not identify an executable callback fail selection.

An app can own a reviewed input-mode catalog and select different pairs with
explicit `wdio.clickMode: 'accessibility'` or `'physical'`. The shared runner
does not infer supported modes from callback names. Consumers must validate
catalog completeness and actual execution; declaring a test does not prove
that it ran. The Win32 Storybook app demonstrates this with separate CI lanes,
shared callbacks in both, and explicit reporting of its existing quarantine.

CLI reports record the selected endpoint and configured renderer. Smoke and
callback runs use canonical `run.json` documents with `kind: 'tests'`; command
lifecycles use `kind: 'lifecycle'`.

## Responsibilities

This package owns Storybook-specific CLI lifecycle, static story manifests,
channel orchestration, and CSF callback execution. General target/suite
configuration, WDIO sessions, service ownership, and aggregate reporting are
owned by `@fluentui-react-native/desktop-test`. Runtime bridge and chrome are
owned by `@fluentui-react-native/storybook-desktop-runtime`.

This is the current implementation boundary, not the finished layering.
`DesktopIntegration.run` takes over the lifecycle and readiness presentation;
the channel child hosts both channel and driver listeners, with Metro in another
child. The approved direction retains these processes initially and moves
resource/workload ownership into the neutral desktop-test host. Storybook will
contribute catalog/channel/context and CSF runner resources; the runtime stays
Node-free. Do not add a separate coordinator package or move supervision into
desktop-driver or MCP.

Agent mode protects the embedded driver and disables the channel's MCP endpoint,
but does not make all channel/runtime mutation ingress exclusively grant-owned.
Unknown story changes now quarantine the driver target; args updates through the
protected driver are unsupported. Runtime reconnect, complete context fencing,
durable recovery wiring, and channel ingress authority remain work in progress.
See `@fluentui-react-native/desktop-driver/references/current-status.md` and
`@fluentui-react-native/desktop-test/references/current-status.md`.

Use the consumer app's agent map for stable app paths and declared entry
commands.
