# Desktop Driver remaining work

## Status

The platform-neutral service, WebDriver contract, typed clients, WebdriverIO
integration, authored story plans, fake test harness, evidence model, bounded
agent API, native build/cache/verification pipeline, Windows/Win32 helper, and
macOS helper are implemented for the V1 command surface.

This plan contains only qualification, hardening, release, or explicitly
deferred work that remains. Current behavior and design decisions belong in the
package documentation:

| Context                                | Authoritative documentation                        |
| -------------------------------------- | -------------------------------------------------- |
| Package use and support matrix         | [README.md](README.md)                             |
| Layering and process model             | [Architecture](references/architecture.md)         |
| W3C service and target registration    | [Service integration](references/service.md)       |
| Public protocol behavior               | [WebDriver contract](references/protocol.md)       |
| Native build, cache, and verification  | [Native helpers](references/native-helpers.md)     |
| FDR1 helper transport                  | [Native protocol](native/PROTOCOL.md)              |
| macOS implementation, signing, and TCC | [macOS provider](native/macos/README.md)           |
| Windows/Win32 implementation           | [Windows provider](native/windows/README.md)       |
| Authored and native tests              | [Test integration](references/test-integration.md) |
| Runner and promotion model             | [CI integration](references/ci-integration.md)     |
| Trust boundary                         | [Security](references/security.md)                 |

When an item below is completed, document its durable behavior in the owning
page and remove it from this plan.

## Release objective

Release `@fluentui-react-native/desktop-driver` as a public,
Appium-independent, W3C-compatible driver for React Native macOS Fabric,
React Native Windows Fabric, and React Native Win32 Paper. Tests should use one
portable WebdriverIO or serializable story-plan contract while native providers
report truthful platform capabilities and preserve exact process and input
ownership.

V1 remains scoped to:

- macOS 14 or later on Apple Silicon;
- Windows 11 x64;
- one active session per physical target;
- loopback-only trusted local operation.

## Windows and Win32 qualification

- [ ] Run the physical Button, Checkbox, Input, and wheel plans on an unlocked
      interactive desktop for both Windows Fabric and Win32 Paper. Capability
      skips on a hosted noninteractive runner are not completion.
- [ ] Complete the full `stories-and-tests` lifecycle on the selected
      authoritative Windows CI environment and confirm no app/helper leaks or
      unreleased input.
- [ ] Qualify occlusion-independent window capture and element crops at 100%,
      150%, and 200% live DPI on both endpoints.
- [ ] Measure UI Automation events, physical input, Windows Graphics Capture,
      cancellation, and forced helper death on the current hosted runner.
      Assign unreliable capabilities to an interactive self-hosted runner
      rather than assuming support.
- [ ] Bound the long-lived native element table under sustained remount and
      multi-window use.
- [ ] Define and test CSS-pixel-to-Windows-wheel-unit conversion.
- [ ] Replace per-mutation detached timeout threads if sustained-provider-stall
      qualification demonstrates that the current model can accumulate work.
- [ ] Decide from measured wait latency whether native UI Automation event
      notifications add enough value beyond authoritative queries to enter V1.

Context:
[Windows provider](native/windows/README.md),
[CI integration](references/ci-integration.md), and
[Test integration](references/test-integration.md).

## macOS qualification

- [ ] Qualify a real Apple Development identity. Record the identity class,
      certificate hash, designated requirement, Xcode/Swift versions, artifact
      ID, permission state, and repeated helper/app restart behavior.
- [ ] Complete the explicit TCC grant/revoke/regrant matrix for Accessibility,
      PostEvent, and Screen Recording, including required helper or parent
      restarts and the responsible process for each result.
- [ ] Prove the authoritative managed CI model on a self-hosted Apple Silicon
      Mac with an auto-logged-in Aqua user.
- [ ] Define and deploy the MDM PPPC policy for Accessibility and PostEvent
      using the selected stable designated requirement.
- [ ] Confirm capture-required plans skip only when Screen Recording is
      explicitly optional; semantic and input plans must fail when required
      authority is absent.
- [ ] Exercise first-run guidance, cache reuse, signing-identity rotation,
      permission continuity, upgrade, and rollback on a clean managed machine.

The local reusable-identity runs, Button/Checkbox/Input authored plans,
secondary Callout windows, 2x Retina crops, permission-denial diagnostics,
input recovery, and direct-spawn versus LaunchServices experiment are complete
and documented in [the macOS provider guide](native/macos/README.md). Do not
repeat them as implementation tasks unless a regression is observed.

## Release hardening

- [ ] Add and freeze the native wire major/minor/feature compatibility suite
      across Node, macOS, Windows, and Win32.
- [ ] Complete a focused security review of loopback serving, target
      registration, artifact confinement, helper substitution, signing,
      process leases, physical-input recovery, and sensitive evidence.
- [ ] Define performance and timeout budgets for startup, lookup, input,
      capture, cancellation, cleanup, and sustained tree traversal.
- [ ] Close remaining cache coverage for stale locks, compatible multi-version
      consumers, in-use Windows artifacts, force rebuild, corruption
      quarantine, and garbage collection.
- [ ] Review packed size, runtime dependencies, platform import policy, native
      source completeness, and first-public-release metadata.
- [ ] Run at least 100 representative executions per endpoint over 14 days with
      at least 99% infrastructure success, zero leaked app/helper processes,
      zero unreleased-input incidents, and complete helper metadata for every
      infrastructure failure.
- [ ] Promote only jobs whose required capabilities are present and whose
      failures and evidence are actionable.
- [ ] Create the release changeset and complete repository publishing checks
      after all required platform gates pass.

## Optional distributed macOS prebuilt

Source builds remain the required complete path. Decide whether the first
release needs an organization-built prebuilt. If it does:

- [ ] Define the external provisioning and publisher trust policy. The package
      must not download or auto-update the artifact.
- [ ] Sign with Developer ID Application, Hardened Runtime, and a secure
      timestamp.
- [ ] Notarize and staple the app bundle.
- [ ] Verify the publisher identity, designated requirement, notarization
      ticket, source digest, artifact hash, and live helper handshake before
      installation.
- [ ] Exercise clean install, first-run permissions, managed install-root
      resolution, upgrade, rollback, and signer rotation.

If no prebuilt is needed, record that decision in
[Native helpers](references/native-helpers.md) and close this section without
adding distribution machinery.

## Deferred work

These items are outside V1 and should start only after a concrete requirement
or the stated evidence gate exists:

- **Persistent macOS broker:** retain direct spawn unless measured authority or
  reliability evidence shows that a stable LaunchServices-owned broker is
  better. A broker would require an authenticated per-user transport, atomic
  install/upgrade, stale-process recovery, and preserved cross-process input
  locking.
- **Executable MCP adapter:** the typed agent API and JSON CLI remain the
  executable automation surfaces. Add a composed MCP adapter only when a real
  client requires it; a schema-only claim is insufficient.
- **Imperative plan sidecar:** keep story plans static and serializable until a
  demonstrated portable scenario cannot be expressed by the DSL.
- **Minimized-window capture policy:** continue returning explicit capture
  unavailability. Consider restore/capture/restore only as a registered-target
  policy after foreground and state-restoration effects are measured.
- **Visual regression:** baseline storage, comparison, tolerances, and approval
  workflow begin only after capture fidelity is fully qualified on all
  endpoints.
- **Legacy E2E migration:** evaluate migration and dual-running separately
  after the new driver reaches platform and scenario parity.
- **Additional platforms and concurrency:** Windows 10, Windows ARM64,
  Intel/universal macOS, and concurrent sessions are future expansion work.

## Completion

The package is release-ready when:

1. required native capabilities pass on authoritative interactive environments;
2. unsupported capabilities skip explicitly and cannot produce false green
   results;
3. build inputs, artifact identity, signing, and provenance are auditable;
4. source builds work without install scripts or an optional prebuilt;
5. attached apps survive and owned resources always clean up;
6. cancellation and helper failure leave no depressed input;
7. security, reliability, package, and CI promotion gates above are complete;
8. README and reference pages describe the final supported operating model.
