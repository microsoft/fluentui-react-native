# Next steps

This file tracks only unfinished work and open decisions. Implemented behavior and constraints live
in [DESIGN.md](./DESIGN.md); setup and execution instructions live in
[README.md](./README.md) and [USAGE.md](./USAGE.md).

## Priority 0: real-platform proof

The safety and false-green fixes are implemented and covered by focused tests and the fake backend.
They still need current evidence from both native backends.

### macOS verification

The shared attach suite passes on macOS 26.6.2 with Xcode 26.4.1 and Mac2 3.2.16. This verifies the
unique Storybook bundle identity, application-state readiness, attach survival, standard clicks,
repeated presses, disabled inertness, Storybook navigation, and matching manifest execution.
Remaining macOS work is:

- Mac2-owned launch behavior;
- `focused` attribute behavior and active-element fallback;
- native wheel scrolling;
- application, WebDriverAgentMac, xcodebuild, and host lifecycle evidence;
- bounded cancellation and cleanup;
- Storybook Run current, Run all, and Cancel behavior; and
- a generated manifest digest matching the Windows job byte for byte.

React Native macOS Fabric 0.81 does not expose `accessibilityState.disabled` through AXEnabled, and
pointer activation does not imply keyboard focus. The portable suite therefore verifies disabled
inertness and treats focus as a separate interaction rather than asserting those platform-specific
states after a click.

The package must not claim a verified macOS compatibility range until this passes on a clean
machine with documented Xcode, accessibility, automation-mode, signing, and GUI-session setup.

### Windows re-verification

Repeat the native Windows run after the process-supervision and lifecycle changes:

- verify attach leaves the original PID and window running;
- verify launch mode stops only the launched application;
- cancel an on-device run and confirm the command interpreter, WDIO runner, driver host, and
  NovaWindows PowerShell descendants all exit within the deadline;
- force post-readiness app and driver-host failures and confirm the run cannot report success;
- inspect an unlocked NovaWindows screenshot for WinAppSDK Composition content; and
- regenerate the Storybook manifest and compare its digest with macOS.

Capture backend-provided application and native-driver PIDs where the native drivers expose them.
Until then, lifecycle reporting must remain explicit about what was observed rather than imply
complete process telemetry.

### Historical application defect regression

The agentic `Button` focus crash is fixed on `main`. Rerun the unchanged shared suite against
NovaWindows to prove the migrated backend still covers click and keyboard-focus transitions.

## Open decisions

| Decision                                                         | Recommendation                                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Should `terminateLaunchedApp` remain public?                     | Deprecate it in favor of owned lifecycle cleanup. Until removal, continue requiring observed `self` ownership.                                               |
| Should Windows use Job Objects for descendants?                  | Evaluate an owned Job Object against supported Windows versions. Keep bounded PID-targeted `taskkill /T` only while its integration behavior remains proven. |
| Should app crashes be product failures or infrastructure errors? | Record an app-under-test crash as `failed` with a distinct lifecycle reason; record driver, host, monitor, and runner crashes as `infrastructureError`.      |
| Should macOS attach have platform-specific types?                | Move toward a discriminated platform target union in the next intentional public API revision; retain strict runtime validation meanwhile.                   |
| Should the portability digest include transitive test imports?   | Add deterministic module-graph hashing only if paths can be normalized across machines. Direct linked spec bytes remain the required baseline.               |
| Should empty manifests ever be valid?                            | Continue failing by default. Add an explicit `allowEmpty` mode only for a demonstrated use case, and report it as skipped rather than passed.                |
| How should linked tests be discovered?                           | Use actual framework discovery for the documented Mocha path. Parser validation is acceptable only if it proves the same runnable, non-skipped selection.    |
| Should Run all isolate every story?                              | Keep one warm invocation/session as the default. Add isolation only as an explicit mode for consumers that accept the startup cost.                          |
| May Storybook control use a remote host?                         | Keep the first release loopback-only. Broaden this only with a separate authentication and threat model.                                                     |
| Is a Windows Graphics Capture fallback required?                 | Decide after inspecting unlocked real-app screenshots containing Composition content.                                                                        |
| What is the long-term Appium 4 hosting path?                     | Keep driver-author imports isolated, measure the supported replacement, and require an explicit decision before adopting a private Appium core host.         |

## Release gate

Before treating the package as release-ready:

1. Run one unchanged shared spec manifest on Windows and macOS.
2. Compare manifest digest, test IDs, and portable command-matrix version.
3. Prove launch ownership, attach preservation, unexpected termination, cancellation, and bounded
   cleanup on both platforms.
4. Validate a clean external consumer with no globally installed Appium driver.
5. Document verified native dependency and platform compatibility ranges.
6. Add the required changeset and publishing metadata.
