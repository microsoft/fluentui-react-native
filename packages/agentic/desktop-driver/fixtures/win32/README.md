# Win32 fixture

A plain Win32 application that the Windows helper contract drives. It is test-only: it is not published, not part of the
helper source digest, and never built at install time. Standard controls give the helper a deterministic UI Automation
provider, so the contract can prove helper behavior (hung and stuck providers, popup windows, title changes, large
trees, retained memory) without React Native.

The opt-in contract builds the fixture on demand with the helper's MSBuild toolchain into the external native cache at
`<cache>/v1/fixtures/win32/<digest>/furn-win32-fixture.exe`. The digest covers this directory and the toolchain
fingerprint, so editing a fixture file rebuilds it and nothing else.

## Run

From the driver package on Windows:

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand win32Fixture
Remove-Item Env:\FURN_NATIVE_DRIVER_TEST
```

Without `FURN_NATIVE_DRIVER_TEST=1` the suite is skipped. Use `--runInBand`: the scenarios share one desktop and one
build cache, and each starts its own helper process because the mutation quarantine is process-wide. A full run takes
about one minute. The onscreen scenario needs an unlocked interactive desktop for hit testing and capture; every other
scenario places the window off every monitor. `yarn test --runInBand protectedService` runs the protected-service suite,
and `yarn test --runInBand operations.contract` runs the agent-operation
suite described below. The latter activates the fixture and sends real
pointer and keyboard input.

## Options

| Option                  | Default              | Effect                                                                             |
| ----------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| `--title <text>`        | `FURN Win32 Fixture` | Main window title; the contract passes a unique value per scenario.                |
| `--nodes <count>`       | `0`                  | Adds a tree view with this many `Item N` entries.                                  |
| `--hang-ms <count>`     | `20000`              | How long the **Hang** button blocks the UI thread.                                 |
| `--stuck-ms <count>`    | `0` (no control)     | Adds a control whose UI Automation `Invoke` blocks this long on a provider thread. |
| `--offscreen <0\|1>`    | `0`                  | Places the main window off every monitor.                                          |
| `--lifetime-ms <count>` | `600000`             | Exits after this long even when the UI thread is blocked; `0` never exits.         |

The lifetime watchdog is the only cleanup guarantee for an abandoned run: the fixture is not in a Job Object.

## Controls

The window is shown without activation. Ids are `AutomationId` values.

| Id          | Control                                                 | Behavior                                                                                                  |
| ----------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1004        | Status label, initially `Ready`                         | Reports results: `Activated N times`, `Hang finished`, `Stuck action applied N times`.                    |
| 1001        | **Activate** button                                     | Counts activations in the status label.                                                                   |
| 1005        | **Rename window** button                                | Appends ` - renamed N` to the title; the helper window id is unchanged.                                   |
| 1006        | **Open dialog** button                                  | Opens the owned popup `Fixture dialog` (label 3002 `Dialog open`, button 3001 `Dialog OK`).               |
| 1007        | **Hang** button                                         | Blocks the UI thread for `--hang-ms`.                                                                     |
| 1008, 1002  | `Name:` label and edit                                  | Keyboard and `clear` target.                                                                              |
| 1003        | **Enabled** checkbox                                    | Toggle pattern target.                                                                                    |
| 1009        | **Stuck action** (`--stuck-ms` only)                    | `Invoke` blocks on a provider thread, then applies once.                                                  |
| 1010        | `Items` tree view (`--nodes` only)                      | `Item N` entries for tree-size and retention scenarios.                                                   |
| 2001 - 2003 | Menu bar `File` (`Increment`, `Exit`), `Help` (`About`) | Menu items in the UI Automation tree. Opening a menu popup needs activation, so popups are not qualified. |

The default tree has 18 nodes; `--nodes N` yields about `N + 24` in total.

## Contract scenarios

`src/native/windows/win32Fixture.contract.test.ts` covers:

- **Basic (onscreen):** roles, names, every selector strategy, accessibility click, hit-test identity, a hit far outside
  every monitor returning null, no active element, and window and element PNG capture.
- **Title change:** an asynchronous rename keeps the window id and publishes `EVENT_OBJECT_NAMECHANGE`.
- **Owned popup:** the owner rejects clicks as `element-not-interactable` while the dialog is open; closing the dialog
  publishes `window-closed` and `EVENT_OBJECT_DESTROY`.
- **Hung provider (`--hang-ms 14000`):** reads and clicks fail as `automation-failed`, windows stay listable, and the
  helper recovers once the app responds.
- **Stuck provider (`--stuck-ms 8000`):** the first click settles as `mutation-indeterminate`, later guarded mutations
  fail fast as `target-quarantined`, and the late effect lands exactly once.
- **Large tree:** 4,900 items stay within the 5,000-node limit; 10,000 items fail `tree` and a root `find` as
  `tree-too-large` while `windows` keeps answering.
- **Retention:** 500 command cycles keep retained elements, working set, and private bytes within the documented bounds.

`src/native/windows/protectedService.contract.test.ts` serves the same fixture through a grant-protected Desktop Driver
service with the real helper behind it, and covers what the fake host in `src/server` cannot show:

- **Grant and ownership:** an unauthenticated request reaches no helper call, a session keeps its owner, and another
  grant gets `target-busy` without learning the holder's grant, session, or process identifiers.
- **Revocation:** revoking a grant closes its launched application and frees the target for the next grant.
- **Quarantine:** a stuck click quarantines the target for every grant while the status and refusal name no session;
  deleting the session verifies the launched application's exit, which ends the helper's quarantine, so the next grant
  clicks once.

Behavior contracts live with the helper: see [Windows helper](../../native/windows/README.md) and the
[protocol](../../native/PROTOCOL.md).

`src/native/windows/operations.contract.test.ts` drives the real service
operation routes rather than raw helper commands:

- Cited activation and physical click, selector-based type/clear, and
  refusal of an ambiguous selector.
- Two actions and a check in a sequence, early stop, and a timed-out wait.
- Window and status-element PNG captures, scaled crop dimensions, and
  byte-for-byte artifact paging verified against SHA-256.
- Published UIA Invoke/Toggle, an unpublished name rejected without effect,
  and journals without action names or typed content.
- A stuck named Invoke that quarantines later operations even after its
  late application effect is observed exactly once.

Physical click and crop alignment have been checked at 100% and 150% scale.
Other DPI configurations and React Native applications remain separate
qualification lanes.
