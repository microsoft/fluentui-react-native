# Next steps

This is the only unfinished-work list for `@fluentui-react-native/desktop-driver`.

Refactor Phases 0-5 are complete. Implemented architecture and invariants live in
[DESIGN.md](./DESIGN.md); setup and operation live in [README.md](./README.md) and
[USAGE.md](./USAGE.md). The original refactor review is summarized in
[suggestions.md](./suggestions.md).

## Phase 6: native proof and compatibility retirement

Phase 6 requires real interactive macOS and Windows machines. Fake runs, JavaScript bundles, unit
tests, and package builds cannot satisfy these gates.

### Shared portability proof

Run one unchanged generated manifest on both platforms and record:

- config fingerprint;
- manifest digest;
- story IDs and plan IDs;
- portable command-matrix version;
- backend and native dependency versions;
- test result summary; and
- lifecycle and ownership artifacts.

The config fingerprint, manifest digest, story IDs, and command-matrix version must match byte for
byte. Any platform-specific test source, branch, or extension disqualifies the run from shared
coverage.

### macOS proof

The shared attach suite previously passed on macOS 26.6.2 with Xcode 26.4.1 and Mac2 3.2.16. Repeat
the proof after the reporting, coordinator, and module refactor and add:

1. **Launch ownership**
   - launch a package-owned `.app`;
   - record observable application and host processes;
   - confirm cleanup stops only self-owned resources.
2. **Attach preservation**
   - attach by unique bundle ID;
   - confirm the original app survives session and host cleanup;
   - verify `ownership.json` records app/window as external.
3. **Readiness**
   - prove XCTest application-state readiness;
   - prove Storybook channel readiness;
   - prove app-shell `testID` readiness.
4. **Portable commands**
   - verify `focused` attribute behavior;
   - verify active-element fallback where supported;
   - verify native wheel scrolling.
5. **Failure behavior**
   - stop the app after readiness and reject a false green;
   - stop the driver host after readiness and classify infrastructure failure;
   - preserve root reports and JUnit.
6. **On-device controls**
   - Run current;
   - Run all with live per-test progress;
   - Cancel with bounded runner/host cleanup.
7. **Process evidence**
   - record application, WebDriverAgentMac, xcodebuild, WDIO runner, and host behavior where the
     backend exposes it.

Document the clean-machine requirements: Xcode version, signing, accessibility permission,
Automation Mode, GUI session, and writable build cache.

React Native macOS Fabric 0.81 does not reliably project
`accessibilityState.disabled` through AXEnabled. Keep disabled-inertness assertions and do not
claim `isEnabled()` support until native projection changes.

### Windows proof

Use NovaWindows on an unlocked interactive Windows desktop.

1. **Driver and prerequisites**
   - run `doctor`, `driver detect`, and `driver verify`;
   - confirm no global Appium driver registry, WinAppDriver service, or Developer Mode dependency.
2. **Attach resolution**
   - attach by PID, exact native handle, identity, exact title, and unique substring;
   - confirm exact title wins over substring;
   - confirm ambiguity fails before the real application session;
   - confirm root discovery session cleanup on success and failure.
3. **Attach preservation**
   - record the original PID/window;
   - run the shared suite;
   - confirm the original app remains alive;
   - verify external ownership.
4. **Launch ownership**
   - launch a package-owned app;
   - confirm only that app and owned descendants are stopped.
5. **Cancellation**
   - cancel an on-device run;
   - confirm the command interpreter, WDIO runner, driver host, and NovaWindows PowerShell
     descendants exit within the deadline;
   - confirm the attached Storybook app survives.
6. **False-green prevention**
   - force post-readiness app exit;
   - force driver-host exit;
   - verify both produce non-passing root reports and JUnit.
7. **Input and historical regression**
   - rerun the unchanged Button click and keyboard-focus suite;
   - confirm the historical RNW focus crash does not recur;
   - cover the focusable components currently protected by the legacy harness.
8. **Visual evidence**
   - inspect an unlocked NovaWindows screenshot for WinAppSDK Composition content;
   - do not treat a blank WebDriver screenshot as valid visual proof.

### Retire the legacy Windows harness

The `@react-native-windows/automation`/WinAppDriver Jest harness remains only as temporary
regression coverage.

Remove it after NovaWindows covers:

- stable story selection;
- attach survival;
- Button pointer-to-keyboard focus transition;
- focus regression cases for migrated components;
- crash detection;
- deterministic UI Automation assertions; and
- required evidence/artifacts in CI.

Retirement includes:

- deleting `windows-tests/`, `jest.windows.config.cjs`, and `smoke-stories.json`;
- removing `@react-native-windows/automation`, WinAppDriver discovery, and legacy scripts;
- updating Storybook instructions and README; and
- proving the replacement workflow on Windows before and after deletion.

## Release readiness

After native proof:

1. validate a clean external consumer with no globally installed Appium driver;
2. inspect the packed artifact and public exports from that consumer;
3. document verified Node, platform, Xcode, React Native, Mac2, and NovaWindows ranges;
4. publish native prerequisite troubleshooting;
5. attach cross-platform digest and ownership evidence to the release change;
6. confirm the changeset and publishing metadata; and
7. decide whether the package remains alpha or advances to the next prerelease stage.

## Open decisions

| Decision                             | Current recommendation                                                                                        | Trigger                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Remove `terminateLaunchedApp`?       | Deprecate in favor of owned session cleanup; continue requiring observed self ownership.                      | Next intentional platform-extension API revision |
| Use Windows Job Objects?             | Keep bounded PID-targeted `taskkill /T` while proven; evaluate Job Objects for stronger descendant ownership. | Native Windows reliability evidence              |
| Platform-specific attach types?      | Move toward a discriminated target union; preserve strict runtime validation meanwhile.                       | Next public type revision                        |
| Hash transitive linked-spec imports? | Add only with a deterministic, cross-platform normalized module graph.                                        | A stale transitive import causes real drift      |
| Allow empty manifests?               | Continue failing. If a real consumer needs it, make it explicit and report skipped, never passed.             | Demonstrated consumer need                       |
| Linked-spec discovery strategy?      | Use actual framework discovery for the documented Mocha path.                                                 | Broader framework support or parser mismatch     |
| Isolate each Run all story?          | Keep one warm session by default; add explicit isolation only for consumers accepting startup cost.           | Measured state-leak failures                     |
| Remote Storybook control?            | Keep loopback-only until a separate authentication and threat model exists.                                   | Approved remote-host requirement                 |
| Windows Graphics Capture fallback?   | Decide after unlocked NovaWindows screenshot evidence.                                                        | Native screenshot proof                          |
| Appium 4 hosting path?               | Keep driver-author imports isolated and require explicit approval before private Appium-core hosting.         | Appium 4 compatibility work                      |
