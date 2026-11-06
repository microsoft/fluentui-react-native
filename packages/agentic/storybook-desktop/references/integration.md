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

For input lanes, set `wdio.inputMode: 'accessibility'` or `'physical'` alongside
the matching `wdio.clickMode`. The runner selects the exact per-test endpoint
annotations extracted from story source, including `both` in each lane.
Every eligible callback must declare the target endpoint before other filters
are applied. Modes are never inferred from names or assertions.

The Win32 app generates its catalog from complete `test --list` discovery and
owns only the explicit quarantine registry. Consumers must still verify actual
execution: classification does not prove a callback ran or grant input
capabilities. Existing exact-pair selection intersects input-mode selection.

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
