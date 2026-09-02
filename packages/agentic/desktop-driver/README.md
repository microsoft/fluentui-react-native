# React Native Desktop Driver

`@fluentui-react-native/desktop-driver` is a W3C WebDriver-compatible remote end
for React Native desktop applications. It does not use Appium.

The package provides the platform-neutral protocol, sanctioned WebdriverIO API,
serializable story-test contract, deterministic fake host, evidence reports,
JSON CLI, and bounded agent API. Native helpers are built explicitly from
checked-in source. Windows and Win32 share the C++ helper in `native/windows`;
macOS uses the Swift Package Manager helper in `native/macos`.

## Package boundaries

| Surface                                 | Responsibility                                              |
| --------------------------------------- | ----------------------------------------------------------- |
| `@fluentui-react-native/desktop-driver` | Public types and common APIs                                |
| `/authoring`                            | Serializable story plans, selectors, and result types       |
| `/wdio`                                 | Sanctioned WebdriverIO connection, commands, and runner     |
| `/agent`                                | Bounded JSON-safe inspection and action API                 |
| `/client`                               | Low-level typed W3C client                                  |
| `/server`                               | Embeddable W3C remote end and target/session state          |
| `/artifacts`                            | Confined atomic evidence persistence                        |
| `/testing`                              | Fake host, fake Storybook orchestration, and test harnesses |

Native source, build/cache resolution, and the process-backed host are exported
from the package root. They remain independent of Storybook, React, and React
Native.

The protocol server remains client-neutral. WebdriverIO is a dependency of the
high-level `/wdio` surface, not an implementation primitive for routing,
capability negotiation, or native hosts.

## Build and resolve the native helper

Native binaries are not published in npm and are never compiled during package
installation. Build explicitly on the target operating system:

```powershell
desktop-driver build-driver --platform windows
```

`windows` and `win32` resolve to the same x64 helper. The build uses the
installed Visual Studio C++ toolchain and Windows SDK, links the CRT statically,
and writes immutable artifacts outside `node_modules`.

On Apple Silicon, build the macOS 14 helper with Xcode's Swift toolchain:

```sh
desktop-driver build-driver --platform macos
desktop-driver build-driver --platform macos \
  --macos-signing-identity "Apple Development: Developer Name (TEAMID)"
```

The build produces a minimal signed agent app in the immutable native cache.
Without an explicit identity it uses an ad hoc signature and warns that TCC
permissions may not survive rebuilds. Set the identity with the CLI option or
`FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`. Stable-signed artifacts are
partitioned by the resolved leaf-certificate SHA-1 hash, and resolution verifies
that hash plus the recorded authority, team identifier, designated requirement,
Hardened Runtime flag, and secure timestamp against the actual bundle signature.
Release builds hash and stage only `Package.swift`, optional
`Package.resolved`, and Swift files beneath `Sources`; local `.build` output
cannot invalidate the cache. Ad hoc release output is stripped of
path-dependent local symbols so identical inputs produce the same binary and
cdhash.

An Apple Development identity is the preferred local identity. A contributor
without an Apple account can create one reusable local certificate in Keychain
Access through Certificate Assistant by choosing a self-signed identity with
the Code Signing certificate type, then trusting that certificate for code
signing. Confirm that macOS exposes it before configuring the driver:

```sh
security find-identity -v -p codesigning
```

Do not recreate that certificate for each build: its leaf hash is part of the
artifact compatibility identity and its designated requirement keeps the
signing identity stable across rebuilt binaries. A local self-signed identity
is for development only; CI and distributed artifacts require organization
signing policy.

Resolve a verified cache artifact or an operator-provided prebuilt:

```powershell
desktop-driver resolve-driver --platform win32 --build-policy never
desktop-driver resolve-driver --platform windows --helper-path D:\tools\furn-desktop-driver-host.exe
desktop-driver resolve-driver --platform windows --install-root D:\tools\desktop-driver
```

The default Windows store is beneath
`%LOCALAPPDATA%\Microsoft\FluentUIReactNative\desktop-driver\native`. Override it
with `--cache-root` or `FURN_DESKTOP_DRIVER_CACHE_ROOT`. Explicit helper and
install-root selections fail verification rather than silently falling back.
Every actual long-lived helper must complete the same build/protocol handshake
before it receives native commands.

The default macOS store is beneath
`~/Library/Caches/com.microsoft.fluentui-react-native.desktop-driver/native`.
`--helper-path` accepts either the signed `.app` bundle or its executable.

Inspect permissions from the same verified helper artifact without prompting:

```sh
desktop-driver doctor --platform macos --permissions
```

The versioned JSON reports Accessibility, PostEvent, and Screen Recording
preflight state; helper PID, parent PID, executable, and app bundle; and
Security.framework signing evidence when macOS exposes it. Signing fields that
cannot be read in process are marked unavailable rather than inferred.
`--prompt` is deliberately separate and interactive:

```sh
desktop-driver doctor --platform macos --permissions --prompt
```

Prompt mode may request Accessibility and Screen Recording access. Ordinary
build, resolve, doctor, handshake, self-test, and stdio commands never request
permission. Restart the helper after changing Screen Recording access.

The V1 helper is launched directly by Node. macOS can therefore attribute
Accessibility, PostEvent, and Screen Recording operations to the responsible
parent application, such as Terminal or an IDE, even though the helper has its
own bundle and signature. Grant the parent application the required Privacy &
Security permissions and interpret the diagnostic `parentPid`, helper
signature, and preflight fields together; a `true` preflight alone does not
prove that the helper owns the TCC grant.

Launching the helper through LaunchServices gives it a separate TCC identity,
but qualification on macOS 26 showed that doing so does not repair a
placeholder-only AX service state. A persistent broker is therefore deferred
until platform evidence shows that it improves authority. Screen capture is a
degradable capability: when Screen Recording preflight is false the helper does
not advertise capture features, while semantic and input automation can
continue.

For manual reset-and-reprompt diagnosis, macOS supports `tccutil reset` for
`Accessibility`, `ScreenCapture`, and `PostEvent`. A bundle-scoped reset affects
only the actual TCC subject; if Terminal, Node, or an IDE was attributed as the
responsible process, resetting the helper bundle identifier may not change that
grant. Never edit `TCC.db` or disable SIP.

Authoritative native macOS CI needs a logged-in Aqua session. Prefer a
self-hosted, managed Mac with a stable signing identity and an MDM PPPC policy
for Accessibility and PostEvent. Screen Recording may still require user
approval, so capture-only evidence should skip explicitly when unavailable.
GitHub-hosted macOS smoke remains useful regression signal but is not proof that
a fresh installation can acquire or retain TCC authorization. Distributed
prebuilt helpers must use Developer ID signing, Hardened Runtime, a secure
timestamp, notarization, and stapling.

## Authoring story tests

Plans are inline static data under `parameters.desktopDriver`. Storybook can
extract and shard them without importing a React Native story module, and
agents can explain the same steps before execution.

```tsx
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'pointer-focus',
          title: 'Responds to activation and receives focus',
          requires: ['focus', 'screenshot'],
          steps: [
            { action: 'wait', target: { testId: 'my-button' } },
            { expect: { state: 'role', target: { testId: 'my-button' }, value: 'button' } },
            { action: 'click', target: { testId: 'my-button' } },
            { expect: { state: 'focused', target: { testId: 'my-button' }, value: true } },
            { action: 'screenshot', name: 'focused-button', target: { testId: 'my-button' } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};
```

Static extraction accepts JSON literals wrapped by TypeScript `satisfies` or
`as`. Do not hide plans behind variables, functions, spreads, computed
properties, or runtime platform branches. Invalid or dynamic plans fail
manifest generation with their source file, story, and line.

Portable selectors are:

- `{ testId }` for deterministic interaction;
- `{ role, name? }` for semantic lookup;
- `{ accessibleName }`;
- `{ text }`.

Supported actions include click, double-click, clear, type, keys, W3C actions,
scroll, Storybook arg updates, waits, screenshots, source capture, and notes.
Assertions cover existence/count, role, accessible name, text/value, displayed,
enabled, focused, selected, checked/mixed, and expanded state.

Use `requires` for capabilities such as `keyboard`, `focus`, `wheel`, or
`screenshot`. Missing capabilities produce an explicit skipped result rather
than a false pass. Platform divergence belongs in declarative `platforms` or
capability requirements, not branches inside a plan.

## Sanctioned WebdriverIO API

```ts
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';

const desktop = await connectDesktopWebdriver({
  platformName: 'windows',
  targetId: 'agenticstorybook-windows',
  url: 'http://127.0.0.1:39859',
});

try {
  const manifest = await desktop.browser.desktopListStories();
  await desktop.browser.desktopOpenStory('components-button--default');
  await desktop.browser.desktopExpect({
    state: 'enabled',
    target: { testId: 'agentic-storybook-button' },
    value: true,
  });
  const result = await desktop.browser.desktopRunStoryTests({
    artifactsRoot: 'artifacts/windows/desktop-driver',
    selection: { tag: 'desktop-e2e', shardCount: 2, shardIndex: 0 },
  });
} finally {
  await desktop.delete();
}
```

Registered browser commands are:

- `desktopListStories()`;
- `desktopOpenStory(storyId, runId?)`;
- `desktopResetStory(storyId, runId?)`;
- `desktopExpect(expectation)`;
- `desktopRunStoryTests(options?)`.

The runner filters by story, test, and tag, shards the sorted
`storyId/testId` list deterministically, checks required capabilities, resets
the preview for every run, and distinguishes assertion, timeout, cancellation,
skip, and infrastructure outcomes.

The server serializes commands per session and all input globally. Timeout
paths abort host work before releasing input, while runner cancellation drains
its in-flight request before cleanup, so a later test cannot inherit a late key
or pointer action.

## Evidence

Supplying `artifactsRoot` writes atomically beneath that root:

```text
artifactsRoot/
  host.json
  run.json
  tests/
    <story>-<test>/
      <named screenshots and source>
      failure.png
      failure-source.xml
      failure-tree.json
```

Artifact names are sanitized and confined beneath the configured root.
Failures attempt screenshot, source, and compact-tree capture; evidence-capture
errors are reported without replacing the original test failure.

## JSON CLI

The CLI prints structured JSON for automation:

```sh
desktop-driver serve --manifest story-manifest.windows.json --target fake-windows

desktop-driver build-driver --platform windows
desktop-driver resolve-driver --platform win32 --build-policy never
desktop-driver doctor --platform windows
desktop-driver doctor --platform macos --permissions

desktop-driver stories list \
  --url http://127.0.0.1:4444 \
  --target fake-windows

desktop-driver stories explain components-button--default \
  --url http://127.0.0.1:4444 \
  --target fake-windows

desktop-driver stories run \
  --url http://127.0.0.1:4444 \
  --target fake-windows \
  --tag desktop-e2e \
  --artifacts artifacts/windows/desktop-driver

desktop-driver agent describe \
  --url http://127.0.0.1:4444 \
  --target fake-windows \
  --scope story \
  --artifacts artifacts/windows/desktop-driver
```

`serve` remains the deterministic fake target for package and protocol tests.
It is not a native-provider substitute.

## Agent API

```ts
import { connectDesktopAgent } from '@fluentui-react-native/desktop-driver/agent';

const agent = await connectDesktopAgent({
  artifactsRoot: 'artifacts/windows/desktop-driver',
  platformName: 'windows',
  targetId: 'agenticstorybook-windows',
  url: 'http://127.0.0.1:39859',
});

try {
  await agent.listStories();
  await agent.openStory('components-button--default');
  await agent.describe({ scope: 'story', depth: 3, maxNodes: 100 });
  await agent.click({ testId: 'agentic-storybook-button' });
  await agent.screenshot('button');
  await agent.runStoryTest('components-button--default', 'pointer-focus');
} finally {
  await agent.delete();
}
```

The API intentionally exposes coarse operations and bounded tree projections.
It does not reveal native handles or permit arbitrary process, environment, or
artifact-path capabilities.

## MCP decision

Phase 3 does not add another MCP listener. The Storybook MCP remains the
documentation and story-metadata surface; the typed agent API and JSON CLI are
the executable native-validation surface. Reconsider a composed MCP adapter
after Stage 2 proves the native commands and their security model. A tool-schema
file without an executable adapter is not considered an MCP integration.

## Protocol and security

See [SPEC.md](SPEC.md) for implemented W3C routes, extension commands,
capabilities, device contracts, and unsupported browser behavior.

The server binds loopback, rejects browser-origin requests, accepts only
server-registered targets, permits one session per physical target, applies
host command deadlines, and preserves attached applications. Never expose it
remotely without a separately designed authentication and transport policy.
