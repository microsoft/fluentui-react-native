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
checks failure behavior. It does not by itself prove automation against a real
React Native app.

To ensure CI never compiles after a separately provisioned or restored helper,
set:

```text
FURN_DESKTOP_DRIVER_BUILD_POLICY=never
FURN_DESKTOP_DRIVER_CACHE_ROOT=<job-specific restored path>
```

Then run `desktop-driver doctor --platform <endpoint>` before app startup.
Restore only cache content produced for the same OS, architecture, source,
toolchain, configuration, and macOS signer. Never cache runtime leases or
borrow another logged-in user's native store.

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

- `macos-storybook` builds packages, bundles, prepares pods, and runs macOS
  `stories-and-tests`;
- `windows-storybook` prepares the generated app, installs the required Windows
  App Runtime for that app, and runs Windows `stories-and-tests`;
- `win32-storybook` runs the same authored plans through the prebuilt Paper
  endpoint.

Those jobs are consumer examples, not generic package requirements. The native
helper itself does not require CocoaPods, the Windows App Runtime, or a
Storybook process.

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
- the platform's remaining qualification items in [PLAN.md](../PLAN.md) are
  complete.
