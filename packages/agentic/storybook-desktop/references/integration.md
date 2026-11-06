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

This is the current implementation boundary, not the finished layering.
`DesktopIntegration.run` takes over the lifecycle and readiness presentation;
the channel child hosts both channel and driver listeners, with Metro in another
child. The approved direction retains these processes initially and moves
resource/workload ownership into the neutral desktop-test host. Storybook will
contribute catalog/channel/context and CSF runner resources; the runtime stays
Node-free. Do not add a separate coordinator package or move supervision into
desktop-driver or MCP.

Owned Node services inherit the neutral harness's per-command socket lifeline
through a Node preload. Its authenticated handshake gates entry, including
late-spawned descendants. The channel registers explicit disposal before
acquiring resources: stop or parent loss aborts initialization, awaits late
acquisitions, then withdraws the agent descriptor through the shared F1 service
and awaits durable driver settlement before closing the channel. The native
helper remains owned by that service and its existing stdio transport.

`driver --agent` awaits a typed `service-ready` receipt naming the descriptor,
command incarnation, and producer PID. The neutral resource scope validates
and retains that receipt on the owned channel's resource generation before
the CLI reports readiness. The generated `agent-ready.*.json` file
is a compatibility breadcrumb only, never readiness authority. The receipt
does not prove target acquisition, application readiness, or authenticated
context/render readiness. Borrowed applications and external services are not
enrolled in the lifeline or implicitly terminated. Missing/failed withdrawal
or stalled disposal is incomplete, not successful cleanup; automatic claim
reclaim remains disabled. There is no fixed-time cleanup guarantee.

Portable Node process contracts exercise parent/wrapper crash, late spawn,
descriptor withdrawal failure, stalled children, and borrowed-process survival.
Live macOS Storybook/Metro/helper survivors still need combined-branch native
qualification; Windows descendant containment is not run on this macOS host.
Accessibility, physical input and capture require their own granted capabilities
and are not qualified by these process fixtures.

Agent mode does not construct upstream `createChannelServer`. Its public API
has no authorization/interception hook, and its HTTP handlers and WebSocket
relay can broadcast arbitrary mutations. Instead the controlled transport uses
the public `buildIndex` API and an owned HTTP/WebSocket server: only
`GET /index.json` is served, other HTTP requests (including `/send-event`,
`/select-story-sync/*`, and `/mcp`) return 403 without reading or echoing values,
and no client WebSocket frame is relayed to another client. Runtime hello and
ready/error messages are consumed locally, bound to the authenticated socket
and F4 connection epoch.

Selection and reset require the session-owning driver grant. The orchestrator
sends prepare followed by `setCurrentStory` only to that authenticated runtime,
waits for correlated readiness, then the driver verifies the native marker.
These mutations use the existing settlement, preview invalidation and
quarantine path. Args remain intentionally unsupported
(`story-args-unsupported`), even for the owning grant; the controlled
orchestrator also refuses direct args dispatch. No argument values enter
transport diagnostics or journals.

Without an agent manifest the upstream channel is **legacy unprotected mode**,
including its HTTP mutation handlers, WebSocket relay and MCP endpoint. It is
not an authority boundary. Channel-only `smoke --mode stories` retains this
legacy path. Manifest-backed traversal (`stories-and-tests`, and the Windows/
Win32 control script when a driver manifest is supplied) opens one driver
session, selects each story through it, and deletes that session before authored
tests acquire their own. It never falls back to upstream selection after a
driver failure. Only pre-dispatch `bridge-unavailable` can be retried;
uncertain navigation and `relaunch-required` fail without replay. The first
story's retry budget covers a cold development bundle
(`STORYBOOK_SMOKE_INITIAL_RENDER_TIMEOUT_MS`, default 300 s); later stories
use 30 s. The Windows smoke relaunches the app between its `stories` and
`tests` phases, so the `tests` phase first selects the first manifest story
with the same budget and waits for authenticated readiness before authored
tests navigate. Authored-test navigation itself does not wait for the bridge.

Epoch/cancellation-aware providers reject stale preview mutations without
invalidating chrome or live secondary windows. Interrupted navigation still
quarantines when dispatch cannot be proven fenced. Native endpoint
qualification of the new ingress remains pending on macOS Paper/Fabric and
Windows Fabric/Win32 Paper. Automatic transport reconnect remains unsupported; see
[readiness and installed upstream limits](readiness.md).
See `@fluentui-react-native/desktop-driver/references/current-status.md` and
`@fluentui-react-native/desktop-test/references/current-status.md`.

Use the consumer app's agent map for stable app paths and declared entry
commands.
