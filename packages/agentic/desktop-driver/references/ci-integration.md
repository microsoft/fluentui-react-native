---
id: desktop-driver.ci-integration
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# CI integration

CI should separate portable package checks, target-OS native contracts, and
real-application automation. A fake-host pass is not a substitute for native
authority, input, accessibility, or capture qualification.

## Gate 1: portable package checks

Run on a normal Node runner:

```sh
yarn
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
```

When package contents or publishing metadata change, also verify that the
packed artifact:

- contains built JavaScript, config, documentation, and all `native/**` source;
- contains no `.exe`, `.app`, object files, Swift `.build`, Visual Studio
  output, cache selections, or signed artifacts;
- has no install/postinstall native build or downloader;
- can be extracted read-only while a separate external cache remains writable.

Repository changes to public types, exports, manifests, dependencies, or
project references also require the root build and publishing checks.

## Gate 2: native build contract

Run on the target OS with its supported toolchain:

```sh
FURN_NATIVE_DRIVER_TEST=1 \
  yarn workspace @fluentui-react-native/desktop-driver test --runInBand
```

PowerShell:

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn workspace @fluentui-react-native/desktop-driver test --runInBand
```

This gate builds source, verifies cache publication and reuse, starts the exact
long-lived artifact, runs the native self-test, exercises FDR1 framing, and
checks failure behavior. On Windows it also drives the helper against the
test-only plain Win32 fixture, whose onscreen scenarios need an unlocked
interactive desktop. When `FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES`
disables input, the fixture scenarios that need a disabled feature or window
capture report explicit skips. It does not by itself prove automation against a
real React Native app.

To ensure CI never compiles after a separately provisioned or restored helper,
set:

```text
FURN_DESKTOP_DRIVER_BUILD_POLICY=never
FURN_DESKTOP_DRIVER_CACHE_ROOT=<job-specific restored path>
```

Then run `desktop-driver doctor --platform <endpoint>` before app startup.
Restore only cache content produced for the same OS, architecture, source,
toolchain, configuration, and macOS signer. Never cache runtime leases or
borrow another logged-in user's native store. The cache root must be outside
the desktop-driver package, `node_modules`, and any pnpm store; the driver
rejects such a root with `invalid-configuration`.

## Gate 3: real application

A consuming app must:

1. build or restore a verified helper;
2. build and launch the exact app under test;
3. start the loopback service with a registered target;
4. provide exact launch or nonce-bound attach identity;
5. run normal WebdriverIO tests or authored plans;
6. upload `run.json`, `host.json`, failure evidence, and bounded native logs;
7. close the session, release input, and stop only owned processes.

Storybook consumers should use
`storybook-desktop smoke --<platform> --mode stories-and-tests`. The `stories`
mode is intentionally render-only and does not require a helper.

This repository's current PR workflow provides examples in
`.github/workflows/pr.yml`:

- `macos-storybook` and `macos-paper-storybook` build packages, bundle, prepare
  pods, and run macOS `stories-and-tests` on Fabric and Paper respectively.
  The shared `.github/actions/setup-desktop-driver` action
  creates a job-local cache, explicitly builds the helper, runs noninteractive
  permission diagnostics without prompting or modifying TCC, and pins later
  resolution to that verified artifact. GitHub-hosted runners use an ad hoc
  signature because changing trust settings requires interactive
  authorization. A managed self-hosted runner can instead pass a
  pre-provisioned stable identity through the action's
  `macos-signing-identity` input. These compatibility jobs retain their
  `physicalClick` mask pending hosted qualification: input authority alone does
  not establish that the intended native element received the pointer;
- `macos-storybook-physical` ("macOS Storybook PR (physical)") mirrors the
  Fabric job with **no disabled input features**, runs
  `yarn storybook smoke --macos --mode stories-and-tests --input physical`,
  and uploads a distinct `Storybook_macos_fabric_physical_*` artifact with
  its doctor report. The macOS physical harness establishes and verifies a
  1024 × 768 logical-point window centered inside visible screen bounds, rather than
  inheriting a persisted frame; it fails clearly if no screen fits or the host
  cannot establish that rectangle. Other input lanes do not request this resize.
  Like the Win32 physical lane, it is an advisory pilot
  outside the aggregate `pr` job's `needs`, not a required qualification gate.
  Local fixes and managed interactive passes do not by themselves qualify
  GitHub-hosted foreground activation, hit testing, or TCC authority;
- `windows-storybook` prepares the generated app, installs the required Windows
  App Runtime for that app, runs the shared Windows native build contract,
  and asks the same setup action to verify the `windows` endpoint before
  running Windows `stories-and-tests` in the accessible lane
  (`--input accessible`);
- `win32-storybook` asks the setup action to build the same Windows provider
  into its own job-local cache, verify the `win32` endpoint, and pin later
  resolution before running the accessible lane through the prebuilt Paper
  endpoint. `win32-storybook-physical` runs the physical lane
  (`--input physical`) the same way with every input feature enabled. It is an
  advisory pilot outside the aggregate `PR` check until hosted physical input
  is qualified.

The Windows Storybook jobs upload their doctor report, successful native build
log, and preserved failed-build diagnostics with the Storybook artifacts.
Both accessible Windows and Win32 jobs also explicitly provision the plain
Win32 fixture and select desktop-test's native MCP/WDIO consumer. Its four
ownership modes must pass, and each non-crash mode must execute both its
ownership and accessibility-input specs without skips. This fixture qualifies
generic native handoff, not React Native rendering or physical input. The
fixture provisioner loads as built Node ESM; the portable native-driver suite
checks that import without compiling or launching a native executable.
Neither `prep` nor `smoke` may compile a helper after the explicit build step.
Because GitHub-hosted Windows is not qualified to provide authoritative global
input, the accessible jobs disable keyboard, physical-click, and wheel
capabilities through the registered host policy, and their lanes exclude the
cases that declare those requirements instead of skipping them. The Windows
native contract's physical-input and window-capture fixture scenarios still
report explicit capability skips, because hosted Windows Graphics Capture cannot
create a capture item. Interactive self-hosted qualification must leave those
features enabled.

The legacy FluentTester E2E jobs (`macos`, `windows`, and `win32`) run the WDIO
`legacy` suite through `desktop-test` with the app-level `yarn e2eprep:<endpoint>`
and `yarn e2etest:<endpoint>` commands, in `apps/fluent-tester` for macOS and
Windows and in `apps/win32` for Win32. They use the same setup action and upload
the run directories, doctor report, and (Windows) helper build logs. Those specs
click, press keys, and scroll with the wheel, and the host rejects a disabled
input feature instead of skipping the test. The hosted macOS job therefore
disables only physical clicks, so `click()` uses the accessibility action, and
the Windows jobs leave every input feature enabled. Whether hosted Windows
delivers that input has not been established.

These jobs are consumer examples, not generic package requirements. The native
helper itself does not require CocoaPods, the Windows App Runtime, or a
Storybook process.

The shared macOS setup enables Keyboard navigation (`AppleKeyboardUIMode=3`)
and verifies AppKit's all-controls Tab preference before launching the app.
Keep this enabled on interactive development and CI Macs. It is not an input
permission, a screen-unlock operation, or the similarly named Accessibility
Full Keyboard Access feature. A locked/noninteractive session or missing TCC
authority still prevents physical input; the macOS helper reports a locked or
switched-out session as `input-unavailable` with a `session` diagnostic, also
shown by `doctor --permissions`. The hosted `physicalClick` policy
in the compatibility jobs still causes tests requiring physical clicks to skip
explicitly. The separate physical pilot leaves that policy unset; unsupported
input must remain visible as incomplete coverage, never a pass. Keyboard-only
CI coverage does not establish physical-click or complete focus qualification.

## macOS runners and signing

Authoritative AX and input qualification needs:

- an Apple Silicon Mac in a logged-in Aqua session;
- the helper running as the intended user, not through `sudo`, a daemon, or an
  SSH-only bootstrap session;
- a stable Apple Development or organization-managed identity;
- Accessibility and PostEvent authorization for the actual responsible
  process;
- an MDM PPPC profile when organization policy supports preauthorization.

Screen Recording may still require user approval. Tests that explicitly
require screenshots can skip when capture is unavailable; semantic or input
tests must fail clearly when their required authority is missing.

GitHub-hosted macOS smoke is useful regression signal but is not proof that a
fresh machine can acquire and retain TCC authorization. Use a managed
self-hosted Mac for release qualification. See
[the macOS provider guide](../native/macos/README.md) for signing, TCC,
Developer ID, notarization, and restart behavior.

## Windows runners

Physical input and live UI Automation need:

- a logged-in, unlocked interactive desktop;
- the helper and target app in the same user session;
- compatible integrity levels;
- no concurrent job sending physical input to that desktop.

Hosted jobs may legitimately report capability skips when they cannot access
the active input session. Treat that as coverage information, not a physical
input pass. Use an interactive self-hosted runner for release qualification of
click, keyboard, wheel, and DPI behavior.

Windows Graphics Capture and UI Automation results should be retained with the
run metadata. App-specific prerequisites such as Windows App Runtime are the
consumer's responsibility, not the driver's.

## Sharding and parallelism

Authored plans can be sharded deterministically:

```sh
desktop-driver stories run \
  --url "$DESKTOP_DRIVER_URL" \
  --target "$DESKTOP_DRIVER_TARGET" \
  --tag desktop-e2e \
  --shard-index "$SHARD_INDEX" \
  --shard-count "$SHARD_COUNT" \
  --artifacts "artifacts/$PLATFORM/shard-$SHARD_INDEX"
```

Do not run shards that send physical input concurrently on one desktop.
Separate them by machine/session or serialize them. The service enforces one
session per target and the helper enforces cross-process input ownership, but
CI should not intentionally create contention.

## Promotion criteria

Before making a real-platform job required:

- failures distinguish assertion, app, helper, authority, and infrastructure;
- required capabilities are available rather than silently skipped;
- helper and app cleanup are ownership-safe;
- artifact collection runs even after failure;
- no helper or app processes leak;
- no input remains depressed after cancellation, crash, or timeout;
