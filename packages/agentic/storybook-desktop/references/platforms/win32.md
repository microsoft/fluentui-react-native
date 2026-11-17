---
id: storybook-desktop.win32
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Storybook on Win32

Win32 is the prebuilt REX Paper host. Bundle before run; native app build is
unsupported. Use `yarn storybook bundle --win32` and `yarn storybook smoke
--win32 --mode stories` (or `stories-and-tests`).

Configure smoke with `createWin32SmokeOptions`, including canonical component,
exact window title, test-ID prefix, and required story IDs. The neutral scope
owns the channel and native REX application; no Metro or shell coordinator is
started. Required IDs must exist in the extracted manifest and channel index.
The native driver verifies sidebar/addon headers, resize controls, and Actions
panel, traverses stories fail-fast with the configured settle delay, and checks
the exact retained host still has live windows. Traversal sessions close before
authored tests. Native cleanup must settle before the protected attach lease
is withdrawn; foreign records remain intact and fail cleanup.

The production bundle embeds the Storybook instance it connects to: the
channel port and instance id, plus the driver manifest's bridge nonce and
digests when bundled with one. `smoke --win32` bundles with its own instance,
but `bundle --win32` and `run --win32` pass none, so a plain bundle connects to
port 7007 without a bridge nonce. Before `run --win32` against
`driver --win32 --agent` or `desktop-test serve --agent`, rebundle from the app
with the serving instance's `STORYBOOK_WS_PORT` (its `storybookPort`),
`FURN_STORYBOOK_INSTANCE_ID` (its `instanceId`), `FURN_STORYBOOK_PLATFORM=win32`,
and `STORYBOOK_DRIVER_MANIFEST` set to the absolute path of the app's
`storybook-desktop.generated/driver-manifest.win32.json`. The driver keeps that
nonce, so the bundle stays valid, until the instance's ports, renderer, or
story catalog change.

Keep app-owned story inclusion in `desktop.config.mts`. The shared runtime
uses desktop chrome for Win32 because the host does not provide normal window
dimensions. Preserve its persistent sidebar, preview, bottom addon panel, and
Callout-backed pop-outs. Keep the REX Unicode-regex compatibility transform
scoped to Win32 until its engine supports Unicode property escapes.

Do not reintroduce mobile drawer/portal behavior or claim a native build for
the prebuilt endpoint.
