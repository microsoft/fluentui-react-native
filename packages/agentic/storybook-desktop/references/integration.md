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

The neutral `DesktopSupervisor` owns the workload claim, report session,
cancellation, resources, and cleanup. An imported integration implements a
side-effect-free `contribute()` plan for the selected action, then runs its
workload inside that scope. For `serve`, it contributes a hosted-driver
acquisition that returns a typed correlated receipt and public Storybook
details; the supervisor verifies and publishes management before emitting
readiness. Standalone `storybook driver` uses the same acquisition path.
Storybook keeps its channel child (which hosts both
channel and driver listeners) and Metro child; both are registered with the
supervisor's resource scope. The Storybook CLI remains a reusable command
surface, not an alternate lifecycle owner. Keep the runtime Node-free. Do not
add a separate coordinator package or move supervision into desktop-driver or
MCP.

For a macOS target with `host.ownership: 'supervisor'`, the channel retains
the instance-specific built application across attached sessions. The CLI
requires the matching live supervisor claim, verifies the built product, and
waits for its private application lease before reporting readiness. The bridge
observes the channel before launch so an early initial render is not lost.
The enclosing channel owns application settlement; uncertain settlement fences
the claim. Windows and Win32 retained Storybook startup is not yet supported.
External applications remain borrowed and are never terminated by this path.

Owned Node services inherit the neutral harness's per-command socket lifeline
through a Node preload. Its authenticated handshake gates entry, including
late-spawned descendants. The channel awaits parent acknowledgement of explicit
disposal registration before acquiring resources: stop or parent loss aborts initialization, awaits late
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
not an authority boundary. Default macOS, Windows and Win32 native smoke uses
manifest-backed traversal, including `stories` mode; a custom channel-only
smoke remains legacy. Manifest-backed traversal opens one driver
session, selects each story through it, and deletes that session before authored
tests acquire their own. It never falls back to upstream selection after a
driver failure. Only pre-dispatch `bridge-unavailable` can be retried;
uncertain navigation and `relaunch-required` fail without replay. The first
story's retry budget covers a cold development bundle
(`STORYBOOK_SMOKE_INITIAL_RENDER_TIMEOUT_MS`, default 300 s); later stories
use 15 s. The Windows smoke relaunches the app between its `stories` and
`tests` phases, so the `tests` phase first selects the first manifest story
with the same budget and waits for authenticated readiness before authored
tests navigate. A relaunched runtime that has said hello but not yet sent its
initial `storyRendered` reports `bridge-unavailable`, not `relaunch-required`,
so this wait keeps retrying. A reloaded runtime whose new socket authenticates
before the old socket closes retires the old bridge in the same way. Authored-test
navigation itself does not wait for the bridge.

Native smoke contributes settings rather than shell coordinators. The borrowed
neutral scope registers Metro and phase-scoped
channel resources before acquisition and drains them in reverse order. Each
channel uses desktop-test's supervisor-lifetime application wrapper with the
same native helper used by attached sessions: independent launch/attach
controllers would compete for its application lock. The exact native identity
is reported before protected application-lease publication. Cleanup closes
the retained native lease before withdrawing its digest-receipted private
record, and refuses changed records. Windows restarts the owned channel/app
generation between phases, without restarting Metro. A failed phase disposal
prevents relaunch and authored tests and leaves the parent claim fenced.
macOS validates the built product's instance bundle identifier and renderer,
retains the exact application in the channel, and attempts its cleanup before
withdrawing the separate read-only attach lease. A failed cleanup fences the
claim; the read-only lease is not proof of settlement. Its native launch is
uncontained; other same-bundle processes are never termination targets.
Application resource diagnostics live in the inherited report; the parent
claim records the enclosing channel resource, not a separately recoverable
application. Bounded automatic native application reconciliation therefore
does not reclaim this composite resource after an unacknowledged crash.

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
