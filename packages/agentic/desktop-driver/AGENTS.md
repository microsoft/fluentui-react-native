# Desktop Driver agent instructions

This is the instruction root for
`packages/agentic/desktop-driver` and every descendant.

## Start every task

1. Read [README.md](README.md) and the narrowest relevant reference:
   [architecture](references/architecture.md),
   [service integration](references/service.md),
   [native helpers](references/native-helpers.md),
   [test integration](references/test-integration.md), or
   [security](references/security.md).
2. For macOS native work, also read
   [native/macos/README.md](native/macos/README.md). For Windows or Win32 native
   work, read [native/windows/README.md](native/windows/README.md).
3. Read [PLAN.md](PLAN.md) only when the task changes qualification, release
   readiness, or deferred scope. It contains remaining work, not the current
   architecture.
4. Inspect the owning source and tests before editing. Use package scripts from
   this directory or the corresponding root workspace command.

## Non-negotiable invariants

- Do not import Storybook, React, or React Native into this package.
- Keep protocol, client, authoring, runner, artifacts, and fake-host code
  platform-neutral. Operating-system behavior belongs behind `DesktopHost`.
- Keep the W3C server client-neutral. WebdriverIO belongs in `/wdio`, composed
  agent/CLI operations, and contract tests, never in routing or host state.
- Register controlled targets on startup. Never accept executable paths,
  environment variables, helper selection, or artifact roots from WebDriver
  capabilities.
- Bind only to loopback, reject browser-origin requests, and fail closed when a
  helper, signature, target identity, permission, or capability cannot be
  verified.
- Permit one active session per target. Serialize each session's commands and
  all physical input, including across independent helper processes.
- Every host operation must honor its `AbortSignal`, stop side effects, settle
  before the queue advances, and release owned input on cancellation, failure,
  or deletion.
- Preserve attached applications. Clean up only helpers, applications, ports,
  and files whose exact ownership was recorded.
- Never compile during install, download a helper, or write native output under
  the package, `node_modules`, or a pnpm store. Publish immutable, verified
  artifacts only to the configured native store.
- Keep plans, manifests, results, CLI output, and agent output serializable.
  Reject unknown or dynamic plan fields instead of silently dropping them.
- Never translate an unsupported native state into `false`. Capability-check it
  and return an explicit skip or unsupported result.
- Confine artifacts beneath the configured root, preserve the original failure
  when evidence capture also fails, and never expose native handles or
  unrestricted commands through agent APIs.

## Detailed development guidance

Use [Contributor reference](references/contributing.md) for module ownership,
change placement, generated files, test expectations, and validation order.
Protocol behavior is authoritative in
[references/protocol.md](references/protocol.md); private native transport is
authoritative in [native/PROTOCOL.md](native/PROTOCOL.md).

When changing user-visible behavior, update the relevant reference and keep
[README.md](README.md) as a concise entry point. When work is completed, move
its durable behavior into documentation and remove it from [PLAN.md](PLAN.md);
the plan must describe only unfinished or explicitly deferred work.

## Validation

Run the package's declared checks:

```sh
yarn format
yarn lint
yarn build
yarn test
```

Set `FURN_NATIVE_DRIVER_TEST=1` only on the matching target operating system to
exercise the real native build, handshake, self-test, cache, and resolution
contract. Stable-signed macOS coverage additionally needs
`FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`.

Use [CI integration](references/ci-integration.md) and
[Test integration](references/test-integration.md) for native and consuming-app
gates. Run root validation when public types, exports, manifests, dependencies,
project references, or package contents change.
