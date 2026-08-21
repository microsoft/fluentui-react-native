# Next steps

This file tracks only unfinished work and open decisions. Implemented behavior and constraints live
in [DESIGN.md](./DESIGN.md); setup and execution instructions live in
[README.md](./README.md) and [USAGE.md](./USAGE.md).

## Priority 0: real-platform proof

The safety and false-green fixes are implemented and covered by focused tests and the fake backend.
They still need current evidence from both native backends.

### macOS verification

Run the complete shared suite and on-device Storybook workflows on macOS, then record:

- Mac2 launch and bundle-identity attach behavior;
- attach leaving the application running;
- observed window readiness;
- `focused` attribute behavior and active-element fallback;
- native wheel scrolling;
- application, WebDriverAgentMac, xcodebuild, and host lifecycle evidence;
- bounded cancellation and cleanup;
- Storybook Run current, Run all, and Cancel behavior; and
- a generated manifest digest matching the Windows job byte for byte.

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

## Priority 1: reporting and public behavior

### Normalize failures and startup diagnosis

- Map configuration, capability, ownership, driver-host, readiness, and runner-spawn failures to
  `infrastructureError`.
- Preserve framework skips and cancellation rather than collapsing them into `failed`.
- Classify application crashes separately from driver, host, monitor, and runner failures.
- Ensure startup, session, and readiness failures still write lifecycle events, `run.json`, and
  JUnit.
- Clear stale endpoint environment state before startup and preserve the original launcher failure
  instead of allowing a secondary "endpoint not published" error.

### Correct report and artifact integrity

- Make `captureArtifacts()` return only files captured by that call, not the cumulative run
  manifest.
- Keep bounded event payloads without applying the same truncation to the complete `run.json`.
- Merge per-worker reports for `sessionStrategy: 'spec'` instead of allowing workers to overwrite
  shared `run.json` and `junit.xml`.
- Cover full reports larger than 100 results and ensure generated JUnit ends with a newline.

### Harden Storybook execution

- Execute Run all through one owned WDIO invocation and warm session while preserving per-story
  progress.
- Add a runner deadline in addition to cancellation.
- Make the generated exact story filter an explicit config-factory contract so Run current cannot
  silently execute every test.
- Resolve Windows launchers through `PATH` and `PATHEXT` instead of assuming every bare command is
  a `.cmd` file.

### Correct CLI and backend claims

- Make `desktop-driver start` remain alive until SIGINT or SIGTERM, or rename it to communicate
  probe-only behavior.
- Make `stories list` validate only the Storybook connection it uses.
- Report direct window-handle discovery as `matchedBy: 'windowHandle'`.
- Preserve backend and transport failures during window discovery instead of rewriting all failures
  as "no matching window."

## Priority 2: transport and runtime hardening

- Validate all nested runtime fields, including target identifiers, launch environment and working
  directory, readiness values, test IDs, Storybook host/port/roots/timeouts, fake scenes, and
  numeric CLI flags.
- Bound every Storybook HTTP request by the remaining operation deadline and distinguish retryable
  responses from terminal errors.
- Return a valid W3C error for oversized bodies without destroying the response socket; cover
  malformed JSON and keep-alive reuse with real loopback requests.
- Detect actual cycles without rejecting valid plans that reuse the same acyclic target object.
- Add robustness coverage for stream failures, temporary-directory cleanup, startup buffer growth,
  long-lived service run retention, and missing desktop augmentation in generated plan steps.

## Priority 3: consolidation

Do these after the behavior above is covered so refactoring cannot hide contract regressions.

- Separate launcher and worker responsibilities behind a validated endpoint/run-context codec while
  keeping the exported service compatible.
- Extract shared loopback mechanics for deadlines, JSON parsing, body limits, shutdown, and address
  validation while retaining distinct W3C and Storybook response schemas.
- Move CLI parsing, `sanitizeNodeOptions`, and direct-invocation detection out of `import.meta`
  entry modules so their pure behavior can be tested normally.
- Consolidate duplicate loopback allowlists, delays, JSON responses, XML escaping, and error-kind
  to result-status mapping.
- Remove the one-line attach-window delegate.
- Use bounded concurrency for window attribute reads, but never cache a native window handle across
  runs.

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
| Is `desktop-driver start` a foreground host or a probe?          | Make it a foreground host. Add daemonized status/stop behavior only as a separate, owned feature.                                                            |
| May Storybook control use a remote host?                         | Keep the first release loopback-only. Broaden this only with a separate authentication and threat model.                                                     |
| Should a launcher/worker split change the public service API?    | No immediate break. Refactor behind the current surface and version any later migration.                                                                     |
| Is a Windows Graphics Capture fallback required?                 | Decide after inspecting unlocked real-app screenshots containing Composition content.                                                                        |
| What is the long-term Appium 4 hosting path?                     | Keep driver-author imports isolated, measure the supported replacement, and require an explicit decision before adopting a private Appium core host.         |

## Release gate

Before treating the package as release-ready:

1. Run one unchanged shared spec manifest on Windows and macOS.
2. Compare manifest digest, test IDs, and portable command-matrix version.
3. Prove launch ownership, attach preservation, unexpected termination, cancellation, and bounded
   cleanup on both platforms.
4. Complete the Priority 1 reporting work so every failure surface produces truthful structured
   output.
5. Validate a clean external consumer with no globally installed Appium driver.
6. Document verified native dependency and platform compatibility ranges.
7. Add the required changeset and publishing metadata.
