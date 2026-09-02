# macOS Native Driver Execution Plan

## Document control

| Field                   | Value                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Status                  | Active; local implementation and qualification complete, external signing/CI/release gates remain |
| Last updated            | 2026-09-02                                                                                        |
| Implementation baseline | `223101834`                                                                                       |
| Related architecture    | [PLAN.md](PLAN.md)                                                                                |
| Scope                   | macOS native helper correctness, signing, TCC permissions, and qualification                      |

This is a living execution plan. Keep task IDs stable, update task status in
place, attach evidence when closing a task, and append dated entries to the
execution and decision logs. Do not remove incomplete work or rewrite prior
decisions; supersede them with a new dated entry.

Status conventions:

- `[ ]` not started
- `[~]` in progress
- `[x]` complete
- `[!]` blocked
- `[?]` requires a decision or experiment

## Current state

The macOS provider implements the V1 FDR1 command surface. Its source build is
now reproducible, stable signatures are verified against their leaf
certificate and designated requirement, signed artifacts require Hardened
Runtime and a secure timestamp, and permission/AX failures carry bounded
diagnostic evidence. A stable-signed real Storybook run rendered all 150
stories and passed the Button, Checkbox, and Input authored plans. Secondary
Callout windows expose distinct opaque handles and can be selected.

Qualification reproduced an intermittent system-wide loss of authoritative AX
window access in the current macOS login session: `AXWindows` succeeded but
returned the application object for Storybook, Calculator, and TextEdit.
LaunchServices helper ownership, raw Swift, and System Events reproduced the
same result while WindowServer showed the target window. The service later
recovered without a code or permission change. A subsequent stable-signed run
rendered all 150 stories, passed all three authored tests, and produced a
correct 2x Retina element crop. Apple Development, managed CI, and Developer ID
release qualification require external identities and infrastructure not
installed on this machine.

The provider must continue to fail closed when it lacks a real AX window. Do
not work around TCC by modifying its database, disabling SIP, sandboxing the
helper, or using undocumented responsibility APIs.

## Completion criteria

The macOS provider is qualified when all of the following are true:

- Stable-signed build, cache, direct-helper, and handshake paths pass on a
  machine with a valid identity.
- Identical source, toolchain, configuration, and signer inputs produce the
  same source digest and binary artifact identity.
- Generated SwiftPM output cannot affect hashing or staging.
- Permission diagnostics distinguish Accessibility denial, PostEvent denial,
  Screen Recording denial, target launch delay, target non-response, and a
  malformed or partial AX tree.
- The responsible-process experiment determines whether LaunchServices startup
  is required.
- The selected launch and signing model keeps Accessibility authorization
  stable across normal source rebuilds.
- Button, Checkbox, and Input authored plans pass with a stable identity.
- Secondary-window identity, Retina capture geometry, denied-permission
  behavior, and helper restart behavior are qualified.
- The supported local-development, CI, and release operating models are
  documented and covered by the appropriate automated or manual checks.

## Milestone summary

| Milestone                             | Status | Exit gate                                                               |
| ------------------------------------- | ------ | ----------------------------------------------------------------------- |
| M0: Correctness blockers              | `[x]`  | Signed verification and deterministic source inputs are covered         |
| M1: Permission diagnostics            | `[x]`  | The helper reports actionable in-process TCC and AX evidence            |
| M2: Attribution experiment            | `[x]`  | Direct-spawn and LaunchServices behavior is compared                    |
| M3: Signing and launch model          | `[x]`  | Stable direct spawn selected; persistent broker deferred                |
| M4: Runtime hardening                 | `[x]`  | Known non-blocking reliability issues are addressed                     |
| M5: Local and component qualification | `[!]`  | Local behavior passed; Apple Development and explicit revocation remain |
| M6: CI and release qualification      | `[!]`  | Requires managed CI and Developer ID infrastructure                     |

## M0: Correctness blockers

### M0.1 Fix stable certificate extraction

- [x] Change the `codesign` invocation in
      `src/native/macos/buildMacOSDriver.ts` to pass
      `--extract-certificates=<prefix>` as one argument.
- [x] Add a unit test that asserts the exact `codesign` argument vector.
- [x] Add an opt-in signed build/verify/cache test driven by a configured test
      identity.
- [x] Verify that the extracted leaf certificate SHA-1 matches the identity
      selected by `security find-identity`.

Acceptance evidence:

- Signed `buildMacOSDriver`, managed-cache verification, and direct signed
  helper verification all pass.
- The artifact manifest records the verified signer rather than only the
  requested signer.

### M0.2 Make source hashing explicit and reproducible

- [x] Hash an allowlist of checked-in macOS provider inputs:
      `Package.swift`, optional `Package.resolved`, and `Sources/**`.
- [x] Exclude `.build`, `DerivedData`, `.git`, editor files, and any future
      generated output from the digest by construction.
- [x] Stage the same allowlisted inputs instead of recursively copying the
      complete `native/macos` directory.
- [x] Add a test that writes files beneath `native/macos/.build` and proves the
      source digest and compatibility key do not change.
- [x] Confirm independent clean staging roots with identical source produce the
      same source digest.

Acceptance evidence:

- Local `swift build` does not change the selected native-driver cache key.
- Staging contains no `.build` subtree.

### M0.3 Remove avoidable binary nondeterminism

- [x] Derive `buildId` from the build fingerprint rather than `Date.now()`.
- [x] Build twice from identical inputs and assert identical `artifactId`
      values.
- [x] Document every remaining input that can intentionally change the
      artifact, including Swift/Xcode version, configuration, architecture, and
      signing designated requirement.

Acceptance evidence:

- A no-op rebuild reuses the same artifact and ad hoc cdhash.
- Changing a declared compatibility input creates a different cache selection.

## M1: Permission and AX diagnostics

### M1.1 Add an in-process permission probe

- [x] Add a helper mode such as `--permissions` that emits versioned JSON.
- [x] Report `AXIsProcessTrusted()`, `CGPreflightPostEventAccess()`, and
      `CGPreflightScreenCaptureAccess()` from the long-lived helper process.
- [x] Support an explicit interactive prompt mode using
      `AXIsProcessTrustedWithOptions` and `CGRequestScreenCaptureAccess()`.
- [x] Include helper PID, parent PID, executable and bundle paths, cdhash,
      signer, team identifier, and designated requirement.
- [x] Surface the probe through `desktop-driver doctor --permissions`.
- [x] Keep noninteractive commands prompt-free by default.

Acceptance evidence:

- Fresh-machine, granted, denied, and revoked states produce distinct JSON and
  exit behavior.
- The CLI explains that Screen Recording changes require helper restart.

### M1.2 Preserve AX failure evidence

- [x] Record raw `AXError`, returned CF type, element count, role, and available
      attribute names for `AXWindows`, `AXMainWindow`, and `AXFocusedWindow`.
- [x] Return this evidence in bounded `HelperError.data`; do not expose native
      handles.
- [x] Map `.apiDisabled` to `input-unavailable` even when
      `AXIsProcessTrusted()` reports true.
- [x] Distinguish `.cannotComplete` target non-response from permission denial,
      launch stabilization, no matching title, and placeholder-only results.
- [x] Preserve strict rejection of `AXApplication` as a target window.

Acceptance evidence:

- A failed session explains whether no real window was returned, which
  attributes were queried, and the AX result of each query.
- Tests cover unsupported, no-value, API-disabled, cannot-complete, invalid
  element, placeholder, and real-window results.

### M1.3 Improve adjacent permission diagnostics

- [x] Make the CoreGraphics frame fallback match by owner PID, normal window
      layer, and unique geometry before relying on `kCGWindowName`.
- [x] Report when title matching is unavailable because Screen Recording is
      denied.
- [x] Remove or explicitly document the nonstandard
      `NSScreenCaptureUsageDescription` plist key.
- [x] Document the supported reset-and-reprompt workflow without claiming that
      bundle-scoped reset always targets the responsible process.

Candidate reset commands for manual diagnosis:

```bash
tccutil reset Accessibility com.microsoft.fluentui-react-native.desktop-driver
tccutil reset ScreenCapture com.microsoft.fluentui-react-native.desktop-driver
tccutil reset PostEvent com.microsoft.fluentui-react-native.desktop-driver
```

If responsibility was attributed to Terminal, Node, or an IDE, a bundle-scoped
reset may not affect the actual TCC subject. Never edit `TCC.db` directly.

## M2: Responsible-process experiment

Run this milestone after M0 and M1 so each run uses stable inputs and produces
diagnostic evidence.

### M2.1 Test matrix

For each row, use the same helper binary, target build, user session, and TCC
state:

| Launch mode                            | Signing mode                | Accessibility                                 | PostEvent                                     | Screen Recording                                 | AX window result                                                    | Responsible process        |
| -------------------------------------- | --------------------------- | --------------------------------------------- | --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- | -------------------------- |
| Node direct spawn of nested executable | Reused local identity       | Granted through parent                        | Granted through parent                        | Granted through parent                           | One full smoke passed; a later run reproduced placeholders          | Node/terminal process tree |
| `open` of helper app bundle            | Reused local identity       | Initially denied; granted manually            | Initially denied; granted with Accessibility  | Initially denied; later advertised after restart | Intermittent: placeholder-only, then a real 34-node Calculator tree | Helper, parent PID 1       |
| `NSWorkspace.openApplication`          | Reused local identity       | Equivalent mechanism; not separately repeated | Equivalent mechanism; not separately repeated | Denied                                           | No evidence that it would differ from `open`                        | Helper                     |
| Node direct spawn of nested executable | Ad hoc, deterministic build | Granted through parent                        | Granted through parent                        | Granted through parent                           | Not used for final smoke                                            | Node/terminal process tree |
| `open` of helper app bundle            | Ad hoc, deterministic build | Denied                                        | Denied                                        | Denied                                           | Not run because preflight denied                                    | Helper, parent PID 1       |

For each run:

- [x] Record the permission-probe JSON.
- [x] Record the raw AX results for all three window attributes.
- [x] Record the helper cdhash and designated requirement.
- [x] Record whether the full Storybook tree and preview marker are visible.
- [x] Record whether physical input and capture work independently.
- [!] Capture TCC attribution using the supported unified log. The local log
  returned no attribution records; parent PID and launch mode provide the
  available evidence.

```bash
log stream --debug \
  --predicate 'subsystem == "com.apple.TCC" AND eventMessage BEGINSWITH "AttributionChain"'
```

### M2.2 Decision gate

- [x] If LaunchServices consistently provides helper-owned attribution and
      direct spawn does not, select the stable installed app/broker design in
      M3.3.
- [x] If launch mode makes no difference, retain direct spawn and investigate
      the raw AX errors, target readiness, React Native macOS AX publication,
      and TCC identity independently.
- [x] If both modes are reliable only with stable signing, make a stable
      identity mandatory for qualification while retaining ad hoc mode as an
      explicitly limited contributor path.
- [x] Record the conclusion in the decision log with links to artifacts.

## M3: Signing and launch model

### M3.1 Stable development signing

- [x] Support a pinned Apple Development identity when available.
- [x] Document creation and reuse of one local self-signed code-signing
      certificate for contributors without an Apple account.
- [x] Keep ad hoc signing supported with a clear warning that TCC grants may
      bind to a specific cdhash.
- [x] Capture `codesign -d -r-` output and add the designated requirement to
      the signed artifact manifest.
- [x] Partition compatibility by the leaf certificate hash and verify the
      designated requirement during managed and direct artifact resolution.
- [x] Define migration behavior for manifests created before this field.

Acceptance evidence:

- A normal rebuild under the same certificate continues to satisfy the
  recorded designated requirement and retains Accessibility authorization.
- A helper signed by an unexpected certificate fails closed.

### M3.2 Signing modes

- [x] Keep `--timestamp=none` only for ad hoc builds.
- [x] Use a secure timestamp and Hardened Runtime for certificate-signed
      artifacts.
- [x] Confirm Hardened Runtime does not regress AX, CGEvent, ScreenCaptureKit,
      or FDR1 behavior.
- [x] Keep the helper unsandboxed; App Sandbox is incompatible with driving
      arbitrary applications through Accessibility.
- [!] Define Developer ID signing, notarization, and stapling for release or
  prebuilt artifacts.

### M3.3 Conditional persistent broker

Do not begin this work until M2 determines that LaunchServices attribution is
required or that per-run process churn is materially reducing reliability.

**Decision:** Deferred. LaunchServices gave the helper independent TCC identity,
but it did not consistently restore authoritative AX windows. Raw Swift and
System Events reproduced the placeholder state while WindowServer showed the
target window; a later LaunchServices FDR1 run exposed a real 34-node Calculator
tree without a transport change. A broker adds lifecycle and transport
complexity without a demonstrated authority benefit.

- [ ] Install the signed `.app` atomically at one stable per-user path.
- [ ] Launch the app through LaunchServices rather than spawning its nested
      executable.
- [ ] Replace stdio transport with a confined per-user Unix domain socket while
      preserving FDR1 framing and command semantics.
- [ ] Authenticate the Node client using a per-launch nonce and verify the
      actual long-lived helper before target registration.
- [ ] Define broker upgrade, stale-process, crash-recovery, cancellation, and
      ownership-safe shutdown behavior.
- [ ] Preserve global physical-input serialization across independent clients.
- [ ] Ensure socket paths, manifests, logs, and permissions are per-user and
      not writable by other users.

Acceptance evidence:

- The same installed helper remains its own responsible process across Node and
  Storybook restarts.
- Upgrade and rollback do not orphan stale brokers or weaken artifact
  verification.

## M4: Runtime hardening

These items are not current release blockers but should be completed before
final macOS promotion.

- [x] Move the physical-input lock from `$TMPDIR` to a stable per-user path
      that is shared across Aqua and remote bootstrap namespaces.
- [x] Resolve the authoritative window frame once per AX tree walk instead of
      issuing position and size reads for every node.
- [x] Append keys to the pressed-key ledger only after a successful key-down
      post.
- [x] Separate stdout and stderr in native build command execution; consume
      stdout only for `swift build --show-bin-path`.
- [x] Make ambiguous Storybook application matches fail immediately instead of
      retrying until timeout.
- [x] Validate nil `launchDate` and `executableURL` values before writing a
      lease.
- [x] Write lease files with mode `0600`.
- [x] Correct direct-helper `artifactRoot` to describe the bundle root.
- [x] Bound and test any long-lived AX element/window caches.

## M5: Local and component qualification

Prerequisites: M0 complete, M1 diagnostics available, and the M3 signing/launch
decision implemented.

- [x] Qualify ad hoc behavior and document its limitations.
- [x] Qualify a reused local self-signed identity.
- [!] Qualify an Apple Development identity. No Apple identity is installed on
  this machine.
- [x] Run Button, Checkbox, and Input authored plans repeatedly after helper,
      Storybook, and Node restarts.
- [x] Verify a secondary Callout window retains a distinct opaque window
      identity.
- [x] Verify Retina whole-window and element crops. A 1x bug was fixed by
      mapping `SCDisplay.displayID` to `NSScreen.backingScaleFactor` and covered
      by native self-test. The live 64.5x34-point Button produced a 129x68-pixel
      PNG on a 2x display.
- [x] Verify Accessibility, PostEvent, and Screen Recording denial separately.
- [~] Verify permission grant/revoke behavior and required restart boundaries.
  Initial denial and manual grant were observed; revocation remains.
- [x] Verify stale-element and remount behavior under real React Native macOS
      Fabric.
- [x] Verify helper crash recovery releases only input recorded as held.

Record the machine, macOS, Xcode, Swift, signer, designated requirement,
artifact ID, Storybook build, and evidence path for every qualification run.

## M6: CI and release qualification

### M6.1 Supported CI model

- [!] Use a self-hosted Mac with an auto-logged-in Aqua user for authoritative
  AX and ScreenCaptureKit qualification.
- [x] Document that the helper must run in an Aqua session, not a daemon,
      `sudo`, or an SSH-only session. A dedicated LaunchAgent remains an
      optional CI deployment mechanism rather than the selected local runtime.
- [!] Define an MDM PPPC profile using the stable helper designated requirement
  for Accessibility and PostEvent.
- [x] Treat Screen Recording as optional evidence when it cannot be silently
      preauthorized.
- [x] Fail clearly when semantic/input qualification lacks authority; skip only
      capture-specific evidence when capture is explicitly optional.
- [x] Do not use GitHub-hosted macOS runs as authoritative TCC qualification.

### M6.2 Release artifacts

- [x] Build from the checked-in source allowlist in a controlled environment.
- [!] Sign with Developer ID, Hardened Runtime, and a secure timestamp.
- [!] Notarize and staple the app bundle.
- [!] Verify the artifact, signer, designated requirement, notarization ticket,
  handshake, and source digest before publication.
- [!] Exercise install, first-run permission guidance, upgrade, cache reuse, and
  rollback on a clean machine.

## Validation sequence

Use the smallest relevant checks while iterating. Before closing a milestone,
run the owning package checks and any required real-machine qualification:

```bash
cd packages/agentic/desktop-driver
yarn format
yarn lint
yarn build
FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand
```

When Storybook lease, launch, authored-plan, or runtime behavior changes:

```bash
cd packages/agentic/storybook-desktop
yarn format
yarn lint
yarn build
yarn test --runInBand
```

Run the root build when public types, manifests, or project references change.
Native authority claims require real-machine evidence; passing unit tests alone
is not sufficient.

## Decision log

Append decisions; do not rewrite old entries.

| Date       | ID  | Decision                                                                                               | Evidence                                                                                                                                                                                                                             | Consequences                                                                                                                  |
| ---------- | --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-01 | D1  | Reject `AXApplication` placeholders and fail closed when no real `AXWindow` or `AXSheet` is available. | Earlier real AX runs followed by placeholder-only runs under ad hoc signing.                                                                                                                                                         | Prevents menu-bar/application objects from being misreported as target windows.                                               |
| 2026-09-02 | D2  | Fix deterministic build inputs and permission diagnostics before selecting a broker architecture.      | Claude Opus 5 review of `223101834`.                                                                                                                                                                                                 | M0 and M1 precede the launch-attribution experiment and M3.3.                                                                 |
| 2026-09-02 | D3  | Retain direct spawn for V1 and defer a persistent broker.                                              | LaunchServices changed TCC ownership but did not consistently change AX results: one run returned placeholders and a later identical flow returned a real 34-node Calculator tree.                                                   | Local users grant the responsible terminal/IDE permissions; helper signing remains stable and verified.                       |
| 2026-09-02 | D4  | Treat placeholder-only AX as an intermittent platform condition, not a provider fallback opportunity.  | WindowServer showed the visible TextEdit window while three independent AX clients returned the application object; the service later recovered and exposed real Calculator and Storybook trees without a code or permission change. | Continue to reject placeholders, preserve diagnostics, and allow a later retry/restart rather than returning false authority. |

## Execution log

Append one row when a task starts, completes, becomes blocked, or produces a
material result.

| Date       | Task                             | Status   | Result or blocker                                                                                                                                                                                                                                                                                                                                   | Evidence                                                                         |
| ---------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 2026-09-01 | Review baseline `223101834`      | Complete | Found two release blockers and identified responsible-process attribution as a testable cause of the AX trust mismatch.                                                                                                                                                                                                                             | Claude Opus 5 review                                                             |
| 2026-09-02 | Create executable macOS plan     | Complete | Converted review findings into milestone tasks, gates, qualification criteria, and update logs.                                                                                                                                                                                                                                                     | This document                                                                    |
| 2026-09-02 | M0.1 stable signing              | Complete | Corrected certificate extraction and executed signed build, cache, leaf-certificate, designated-requirement, and handshake verification with a reusable local identity.                                                                                                                                                                             | `nativeDriver.test.ts`; local identity `FURN Desktop Driver Development`         |
| 2026-09-02 | M0.2-M0.3 deterministic build    | Complete | Source hashing and staging use the same Swift-source allowlist. Release builds remove random UUID and local-symbol path metadata before signing; forced ad hoc rebuilds are byte-identical and corrupt collisions self-heal.                                                                                                                        | Opt-in native package test                                                       |
| 2026-09-02 | M1 permission and AX diagnostics | Complete | Added nonprompt/prompt permission JSON, in-process signing evidence, bounded lazy AX attribute diagnostics, FDR1 error data, CoreGraphics fallback evidence, and CLI tests.                                                                                                                                                                         | 81-check native self-test; `doctor --permissions`                                |
| 2026-09-02 | M2 attribution experiment        | Complete | Direct spawn inherited parent grants. LaunchServices isolated TCC identity, but helper-owned Accessibility still returned placeholder-only AX windows.                                                                                                                                                                                              | `files/launchservices-fdr-result.json`; permission probe outputs                 |
| 2026-09-02 | M4 runtime hardening             | Complete | Stabilized input locking, corrected all key-ledger ordering, cached frames per walk, hardened lease writing, fixed direct bundle roots and immutable collision recovery, and verified signed policy.                                                                                                                                                | Package tests and independent M0/M4 review                                       |
| 2026-09-02 | M5 authored components           | Complete | Stable signed Storybook rendered 150 stories and passed Button, Checkbox, and Input plans. A transient Fabric role read was narrowed to stale-element recovery.                                                                                                                                                                                     | `apps/storybook/artifacts/macos/desktop-driver/run.json`                         |
| 2026-09-02 | M5 secondary Callout             | Complete | The primary app and Callout exposed distinct opaque handles and both handles could be selected after secondary activation semantics were corrected.                                                                                                                                                                                                 | `files/macos-callout-window-qualification.json`                                  |
| 2026-09-02 | M5 Retina rerun                  | Complete | Both displays are 2x. The matched AppKit backing scale produced a 129x68 PNG for the 64.5x34-point Button element, and all authored plans passed.                                                                                                                                                                                                   | Native scale self-test; `apps/storybook/artifacts/macos/desktop-driver/run.json` |
| 2026-09-02 | Final exact-source validation    | Complete | Signed native tests, all 81 Swift checks, affected format/lint/build/tests, package dry-run, macOS bundle, root build, publishing, changeset, affected links, formatting, structural lint, and repeated 150-story/3-plan smoke passed. The full link sweep alone remains externally blocked by an unrelated Apple HIG URL returning HTTP 502 twice. | Local command logs and Storybook run artifacts                                   |
| 2026-09-02 | Final code review                | Complete | Claude Opus 5 and focused review passes found and resolved window truncation, eager diagnostics, incomplete uniqueness, malformed AX values, fallback consistency, and unsafe CoreGraphics correlation. The final full-diff review reported no findings.                                                                                            | Final review agents and 81-check self-test                                       |

## References

- [TN3127: Inside Code Signing Requirements](https://developer.apple.com/documentation/technotes/tn3127-inside-code-signing-requirements)
- [Code Signing Requirement Language](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/RequirementLang/RequirementLang.html)
- [AXUIElementCreateApplication](https://developer.apple.com/documentation/applicationservices/1459374-axuielementcreateapplication)
- [AXError](https://developer.apple.com/documentation/applicationservices/axerror)
- [Resetting access to protected resources](https://developer.apple.com/documentation/xcode/resetting-access-to-protected-resources-in-macos)
- [Privacy Preferences Policy Control payload settings](https://support.apple.com/guide/deployment/privacy-preferences-policy-control-payload-dep38df53c2a/web)
- [TN2083: Daemons and Agents](https://developer.apple.com/library/archive/technotes/tn2083/_index.html)
- [Apple Developer Forums: code signing and TCC guidance](https://developer.apple.com/forums/thread/730043)
- [Apple Developer Forums: App Sandbox and Accessibility](https://developer.apple.com/forums/thread/749494)
