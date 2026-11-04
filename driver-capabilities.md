# Desktop driver capabilities on macOS

Research into what `@fluentui-react-native/desktop-driver` and
`@fluentui-react-native/desktop-test` (with `storybook-desktop`) give an agent
and an automated test on macOS, compared with working without them and with
Callstack's [`agent-device`](https://github.com/callstackincubator/agent-device).

- **Revision:** `c84acb741` (`main`, 2026-11-02). Includes #4426, which lists macOS accessibility actions.
- **Lenses:** agent-driven workflows (an agent diagnosing or exploring a running app) and automated testing.
- **Evidence labels:** **Observed** means measured or run for this report. **Code** means read from source or package
  references at this revision but not executed. **External** means third-party documentation. **Estimate** means computed
  from a model or synthetic data.

## Summary

- **Raw capability is the driver's strength.** On macOS, desktop-driver gives an agent or test exact control
  identity, accessibility state (focus, checked, expanded, selected, value), hit-tested clicks that name what blocked
  them, a window-event journal, and authenticated Storybook story selection. These are things screenshots and
  `osascript` cannot provide reliably. The driver also refuses to fake unsupported state.
- **Agent ergonomics are its weakness.** The agent-facing CLI exposes only `describe` and `screenshot`. Each call
  creates and deletes a session, the output is pretty-printed JSON, and **the CLI cannot attach, so it fails against
  the Storybook target (Observed, §3.6).** In practice agents write `wdio` callbacks or attach scripts, which costs
  about 4 s and a code edit per question.
- **Context cost depends on format, not content.** The full tree as stored is about 14k tokens. A compact interactive
  outline of the same tree is about 0.7k, and a story-scoped one about 40 (Estimate). A Retina window screenshot is
  roughly 1.1k to 1.5k image tokens and carries no identities.
- **agent-device is the reference design for agent ergonomics.** It has a persistent daemon, `@eN` refs pinned to a
  snapshot generation, interactive-only and diff snapshots, MCP and skills, and record and replay to `.ad` or Maestro.
  It is mobile-first. Its macOS backend defaults to XCTest Automation Mode (a system overlay plus the shared pointer).
  The AX-only native backend is opt-in, has open correctness gaps, and cannot express drag, hold, or double-click.
  It has no Windows support and no W3C WebDriver portability.
- **For automated testing, desktop-test is the stronger fit here.** The same WebdriverIO tests run on macOS, Windows,
  and Win32. Statuses are honest, failure evidence is ordered, lifecycle is owned, and tests live with their stories.
  Proven results: legacy E2E 62/62 on macOS and Storybook smoke 280/280. agent-device replay is better for turning an
  exploratory agent session into a regression script, but it does not cover Windows.
- **Top suggestions:** add a persistent agent session (CLI daemon or MCP) with `find`, `click`, `type`, `check`,
  `wait`, and `describe`; make the agent attach by default with automatic lease handling; add a compact text tree with
  refs, interactive-only filtering, and diffs; add `stop`, orphan cleanup, and stale-lock recovery; invoke
  accessibility actions; and export agent sessions as `wdio` callbacks (§5).

## 1. Method

- **Source and references.** Read `desktop-driver`, `desktop-test`, `storybook-desktop`, the macOS helper
  (`native/macos`), the desktop-testing skill, `apps/storybook/agent-map.yaml`, and package references.
- **Context measurement (Observed).** A script tokenized 61 real macOS failure-evidence sets from
  `apps/storybook/artifacts/desktop` (Storybook app, Fabric, 1360×994-point window on a 2× display). Text uses the
  `o200k_base` tokenizer; other model tokenizers differ, so treat the numbers as relative sizes. Screenshot image
  tokens apply each vendor's published resize formula to the observed 2720×1988 PNG (Estimate).
- **Latency (Observed).** Helper-side `durationMs` values come from the command journals in `window-events.json`;
  test durations come from `run.json` across all local runs.
- **Agent CLI probe (Observed).** The built `desktop-driver agent describe` command was run against an in-process fake
  host registered once as attach-only (the mode Storybook uses) and once as launch-capable.
- **Friction (Observed).** Desktop-driver activity records from the personal workflow log (October 2026) supplied
  real agent failures and workarounds.
- **Comparisons (External).** A research pass read `callstack/agent-device` at commit `cf9153e19` (npm 0.21.36,
  2026-11-02): source, ADRs, docs, and Callstack's published benchmarks. It also covered Appium mac2, System Events
  scripting, Peekaboo, and computer-use agents. agent-device was not installed or run against the FURN app, so its
  token numbers here are its own published figures or analogies to the compact outline (Estimate).
- **Not done.** No new live macOS app session was started for this report, so latencies come from recorded runs.
  `osascript` and unrestricted screen capture were not exercised because the repository requires separate
  authorization for them (R-PERM-007).

## 2. What the packages provide on macOS

### 2.1 Layers

```text
agent or test code
 ├─ /wdio  connectDesktopWebdriver, attachDesktopWebdriver (WebdriverIO 10)
 ├─ /agent DesktopAgent: find, click, type, check, describe, screenshot, runStoryTest
 ├─ CLI    desktop-driver: agent describe|screenshot, stories list|explain|run, doctor, build-driver
 ├─ desktop-test       config, lifecycle (bundle/prep/build/run), suites, statuses, artifacts
 └─ storybook-desktop  story manifest, authenticated story selection, wdio callbacks, smoke
        │ W3C WebDriver Classic over loopback HTTP
desktop-driver server (Node): sessions, policy, selectors, evidence, input queues
        │ FDR1 framed stdio
macOS helper (Swift, LSUIElement): AXUIElement, Quartz Event Services, ScreenCaptureKit, AXObserver
```

### 2.2 Driver capabilities (Code, verified against the Swift helper and server)

| Area                 | macOS behavior                                                                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sessions             | `launch` or `attach` to a server-registered target. One active session per target. Attach needs exact identity and a nonce-bound application lease. Clients cannot supply executables, paths, or environment.                                                                                                 |
| Lookup               | `accessibility id` (testID), `tag name` (normalized role), `link text` and `partial link text` (accessible name), `-furn:text`. No XPath, CSS, or script execution. Element IDs are opaque UUIDs; stale elements are never reconstructed.                                                                     |
| State                | `testID`, name/label, role, value, `focused`, `enabled`, `checked`, `expanded`, `selected`, displayed, rect, and `accessibilityActions` (names only, #4426). `helpText` and `required` return `unsupported operation`, never a fabricated `false`.                                                            |
| Click                | `furn:clickMode` of `physical` (Quartz event after a hit test; `element click intercepted` names the occluding element or foreign app and PID), `accessibility` (AXPress), or `auto` (physical, falling back to AXPress when physical input is unavailable or disabled by target policy).                     |
| Keyboard and pointer | W3C actions with key, pointer, wheel, and pause sources; a pressed-key ledger supplies modifier flags; element clear and send keys.                                                                                                                                                                           |
| Windows              | Handles, switching (moves key-window status), activation, read and set rect where AX allows.                                                                                                                                                                                                                  |
| Capture              | Window and element screenshots through ScreenCaptureKit in backing pixels. Needs Screen Recording; without it the screenshot features are not advertised. Minimized or off-screen windows fail.                                                                                                               |
| Inspection           | `furn/tree` (JSON tree), page source (XML), and `furn/window-events`: a 512-entry AXObserver ring plus a 128-entry command journal with age and duration.                                                                                                                                                     |
| Storybook            | `furn/manifest`, `furn/story`, `furn/story/reset`, `furn/story/args`; readiness is authenticated by nonce, run ID, plan digest, preview generation, and a story-root marker.                                                                                                                                  |
| Safety               | Loopback only and browser `Origin` rejected. Commands are serialized per session, and physical input takes a cross-process per-user lock. Every native call has a deadline and abort signal. After a helper crash, a release-only mode lets up held keys and buttons. Cleanup touches only resources it owns. |
| Diagnostics          | `doctor --permissions [--prompt]` reports Accessibility, PostEvent, Screen Recording, signing (cdhash), and console-session state. A locked screen or non-console session fails fast with `input-unavailable`.                                                                                                |
| Platform             | macOS 14+, Apple silicon only. Ad hoc signing loses privacy grants on rebuild; a stable identity is configured with `FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`. No Developer ID or notarized build yet (#4345). Helpers are built explicitly; installation never compiles or downloads.                     |

`furn:features` advertises `accessibilityActions`, `accessibilityClick`, `elementScreenshot`, `focus`, `keyboard`,
`physicalClick`, `screenshot`, `setWindowRect`, `wheel`, and `windowEvents`, so tests and agents can branch on real
capability instead of on platform.

### 2.3 Harness capabilities (Code)

- **`desktop-test`:** `desktop.config.mts` (`defineDesktopConfig`, schema 1) declares installed, React Native Test App,
  or REX targets for macOS, Windows, and Win32. Commands cover `build-driver`, `bundle`, `prep`, `build`, `run`,
  `test --suite <name> [--list]`, and `serve --json`. WebdriverIO and Jasmine own sessions, hooks, and retries.
- **Results:** Each run writes `artifacts/desktop/<run-id>/` with `events.jsonl`, `run.json`, `junit.xml`, and redacted
  command logs. Statuses separate passed, failed, skipped, timed-out, cancelled, infrastructure-error, flaky, and
  incomplete. Empty, unmatched, or all-skipped runs are not passes (R-DTEST-001; the WDIO all-skipped case is #4342).
- **`storybook-desktop`:** Stories carry top-level CSF3 `wdio` callbacks. Each named case runs in its own Node worker
  and WebDriver session against a freshly remounted preview, with `browser`, `expect`, typed `desktop` helpers,
  `platform`, an abort `signal`, and `skip(reason)`. Failure evidence is captured window events first, then
  `failure.png`, source XML, tree JSON, and up to four other windows. `smoke` owns the whole app lifecycle; `test` runs
  against an already running app.
- **Storybook MCP:** The Storybook channel server enables upstream `@storybook/react-native` MCP at `/mcp` (story
  selection and documentation tools). It does not expose driver inspection or input.

### 2.4 The agent surface today

| Path                                                               | What an agent gets                                                                            | Limits                                                                                                                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `desktop-driver agent describe` / `agent screenshot`               | Bounded tree (`depth` 3, `maxNodes` 100, `story` or `application` scope) or a screenshot file | Only these two operations. Each call creates and deletes a WebDriver session. **No launch-mode option, so it fails against attach-only targets such as Storybook (Observed, §3.6).** |
| `desktop-driver stories list`, `explain`, `run`                    | Story catalog and story test execution                                                        | Pretty-printed manifest JSON, about 19.5k tokens for the 209-story catalog (Estimate, §3.3).                                                                                         |
| `/agent` `DesktopAgent` in a Node script                           | `find`, `click`, `type`, `check`, `describe`, `screenshot`, `runStoryTest`                    | The agent must write and run a script; `connectDesktopAgent` also defaults to `launch`.                                                                                              |
| `/wdio` `attachDesktopWebdriver` in a Node script                  | All of WebdriverIO                                                                            | Needs the application lease that `yarn storybook test --macos` writes; the agent writes code.                                                                                        |
| `yarn storybook test --macos --test <glob>` with a `wdio` callback | Full WebdriverIO in an isolated worker, fresh preview, failure evidence                       | About 4 to 4.6 s per single-test run (Observed). Requires editing the story file and restarting the driver and reloading the app when callbacks change.                              |
| Storybook MCP `/mcp`                                               | Story selection and documentation                                                             | No element tree, state, or input.                                                                                                                                                    |

In practice, agents in the workflow records diagnosed the macOS app by writing `wdio` callbacks or ad hoc attach
scripts, not through the `agent` CLI.

## 3. Agent-driven workflows

The three baselines:

- **No package.** The agent uses `screencapture`, `osascript` (System Events UI scripting and AX attributes), and
  coordinate-click tools. This needs Accessibility and Screen Recording grants for the terminal and, in this
  repository, separate authorization (R-PERM-007).
- **desktop-driver as shipped.** Through the paths in §2.4.
- **agent-device.** A Node CLI with a persistent daemon, MCP server, and typed client, built for agents. On macOS it
  has two backends (External, ADR 0031):
  - **XCTest (the default for the `app` surface).** Uses the XCUITest runner. This puts the Mac in Automation Mode,
    which shows a system overlay and moves the real shared pointer. It is the same mechanism as Appium mac2.
  - **Native (opt-in).** A Swift helper that uses only the accessibility (AX) API and ScreenCaptureKit
    (`AGENT_DEVICE_MACOS_APP_BACKEND=native`). It refuses drag, hold, double-click, secondary click, gestures, and
    recording. It also has open gaps, tracked in issue #3213.

  The `desktop`, `frontmost-app`, and `menubar` surfaces always use the AX helper.

### 3.1 Raw capabilities

| Capability                                     | No package (screenshots, `osascript`, coordinates)                 | desktop-driver on macOS                                                        | agent-device on macOS                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Find a control by testID                       | No; System Events sees AX identifiers only through verbose scripts | Yes, `~testID`, with strict multi-match errors in WDIO                         | Yes, `id=` selector or `@eN` ref                                                                             |
| Read focus, checked, expanded, selected, value | Partly, through AX attribute scripts; visually otherwise           | Yes, typed properties; unsupported values are errors                           | Yes, `is focused`, `get attrs`, and snapshot state                                                           |
| Stable handles across steps                    | None (coordinates)                                                 | Opaque element UUIDs within a session; no refs in tree output                  | `@eN~sG` refs that fail if the tree generation changed                                                       |
| Click                                          | Coordinates, so 1× vs 2× scale mistakes; System Events `click`     | Hit-tested physical click with an occluder report, AXPress, or `auto` fallback | XCTest click (overlay, shared pointer) or AX action; native refuses pointer actions without an AX equivalent |
| Double-click, drag, hold, wheel, key chords    | Coordinate tools only                                              | W3C actions: key, pointer, wheel, and pause sources                            | XCTest backend only for drag, hold, and double-click                                                         |
| Custom accessibility actions                   | Possible with `perform action` scripts                             | Listed (#4426); not invokable                                                  | Listed in `snapshot --actions` (External)                                                                    |
| Window rect and switching                      | `osascript`                                                        | Yes (where AX allows)                                                          | No window management commands                                                                                |
| Event history                                  | None                                                               | 512-entry AX observer ring plus 128-entry command journal                      | Session `events.ndjson` journal of agent actions                                                             |
| Snapshot diff                                  | No                                                                 | No                                                                             | Yes, Myers diff with fresh refs                                                                              |
| Storybook story navigation                     | Click through the sidebar                                          | `furn/story` with authenticated readiness                                      | None built in (Storybook MCP could be added separately)                                                      |
| React Native tooling                           | None                                                               | None (Storybook MCP serves docs only)                                          | `metro reload`, React DevTools tree, inspect, and profile, LogBox dismissal; macOS use unverified            |
| Logs, network, performance                     | None                                                               | Command logs only in desktop-test                                              | `logs`, `network dump`, `perf`, CDP memory (mostly mobile)                                                   |
| Scope of authority                             | Any app the terminal is granted                                    | Registered target only; loopback; global input lock                            | Session app on `app`; all apps on `desktop` and `menubar`; authenticated loopback daemon                     |
| Agent interface                                | Shell                                                              | Two CLI commands, Node API, WDIO                                               | CLI, MCP tools, skills, typed client                                                                         |
| Windows and Win32                              | Different tooling                                                  | Same API through UIA                                                           | Not supported                                                                                                |

### 3.2 What the driver adds over no package

- **Identity instead of coordinates.** The agent addresses `~save-button` or a role and name, not pixels.
  Screenshots are backing-pixel images (2×) while AX uses points, so coordinate reuse is a known source of
  off-by-a-factor clicks; `agent-map.yaml` forbids copying screenshot coordinates.
- **State it cannot see.** Focus, `checked`, `expanded`, `selected`, value, and enabled come from AX directly.
  A screenshot shows a focus ring only if the component draws one, and a switch's state only if the agent reads
  the thumb position correctly.
- **Explanations for failed input.** A blocked click names the occluder (for example an addon panel or another app
  and its PID). The window-event journal shows what changed and how long each command took.
- **Scoped, bounded authority.** The driver can only touch a registered target, refuses remote and browser callers,
  and serializes physical input across processes. `osascript` can drive any application the terminal has been
  granted, which is why the repository gates it.
- **Story-aware navigation.** `furn/story` selects a story and waits for authenticated readiness, replacing several
  screenshot-and-click rounds through the Storybook sidebar.

### 3.3 Context cost

Median per-observation sizes from the 61 macOS evidence sets (Observed unless marked):

| Observation                                               | Median tokens (range)                                                        | Notes                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Full `furn/tree`, pretty JSON (as written to evidence)    | 14.2k (11.6k–18.4k)                                                          | 70 KB; 157 nodes, of which 69 are interactive roles and 12 have testIDs; maximum depth 3.         |
| Same tree, minified                                       | 7.8k                                                                         |                                                                                                   |
| Same tree, minified without `rect`                        | 4.8k                                                                         | Rects are about 40% of the minified payload.                                                      |
| `agent describe --scope application` (depth 3, 100 nodes) | 9.4k                                                                         | Pretty JSON with rect and states on every node.                                                   |
| `agent describe` default (`story` scope)                  | 223 (max 2.1k)                                                               | Story subtree only.                                                                               |
| Page source XML                                           | 6.8k                                                                         |                                                                                                   |
| `window-events` JSON                                      | 5.0k                                                                         | Full 512 + 128 entry ring, not a recent tail.                                                     |
| Compact text outline, all named nodes (Estimate)          | 824                                                                          | One line per node: role, name, testID, state.                                                     |
| Compact outline, interactive only (Estimate)              | 683                                                                          |                                                                                                   |
| Compact outline, story-scoped interactive (Estimate)      | 39 (max 341)                                                                 |                                                                                                   |
| Window screenshot, 2720×1988 PNG (Estimate)               | ~1,530 (Claude) / ~1,105 (OpenAI high detail)                                | 340 KB. Carries no selectors or state; downscaling to 1× points would roughly halve tile counts.  |
| `stories list` for 209 stories (Estimate)                 | ~19.5k pretty manifest; ~12.7k `DesktopAgent.listStories`; ~2.1k ID-per-line | Reconstructed from a 243-test smoke run's story IDs; static plans in real entries would add more. |

Illustrative cost of a five-observation diagnosis loop (Estimate, from the medians above):

| Observation format            | Five observations                                   |
| ----------------------------- | --------------------------------------------------- |
| Full tree JSON as stored      | ~71k tokens                                         |
| Window screenshots            | ~5.5k–7.7k image tokens, with no element identities |
| Compact interactive outline   | ~3.4k tokens                                        |
| Story-scoped `agent describe` | ~1.1k tokens                                        |
| Story-scoped compact outline  | ~0.2k tokens                                        |

The content an agent needs is small; the format is not. A story-scoped describe is already cheap, but the
`application` scope, stored evidence, and `stories list` are 10 to 20 times larger than a compact outline of the same
information. The story-root's accessible name also carries JSON readiness metadata, which is noise for an agent.

**Against agent-device (External and Estimate).** agent-device's default output is close to the compact outline
above: one text line per node with an `@eN` ref, `-i` for interactive only, `-d` and `-s` for depth and scope,
off-screen summaries, and `snapshot --diff`. Callstack reports 12 snapshot reads costing about 5k tokens, roughly the
cost of three screenshots. They also report a debugging session falling from about 150k to 69k tokens after these
optimizations. If an agent-device-style outline were applied to the FURN tree, it would land near the 0.7k and 40
token rows. That is roughly 10 to 20 times less than the driver's application-scope JSON. Diffs would make repeat
observations smaller still. The driver's advantage is precision rather than size: typed states, rects when needed,
and a journal that explains _why_ something changed.

### 3.4 Latency and round trips

Helper-side command latency (Observed, from command journals):

| Command               | Median | Tail                   |
| --------------------- | ------ | ---------------------- |
| `snapshot`, `windows` | 0–2 ms |                        |
| `attach`              | 2 ms   | max 983 ms             |
| `probe`               | 5 ms   |                        |
| `performActions`      | 19 ms  |                        |
| `tree`                | 58 ms  |                        |
| `find`                | 65 ms  | p90 498 ms, max 693 ms |
| `source`              | 79 ms  | max 1.16 s             |
| `click` (physical)    | 121 ms |                        |
| `captureWindow`       | 152 ms |                        |

- **Native operations are not the bottleneck.** Most are under 150 ms.
- **Per-invocation overhead is.** Each `agent` CLI call starts Node, creates a session, and deletes it: 160 ms against
  the fake host as a lower bound, and the failing attach-only call took 1.66 s to exit (Observed).
- **Authored callbacks are slower still.** A single-test `yarn storybook test` run takes about 4 to 4.6 s wall time,
  plus the edit, driver restart, and app reload when the callback changes. Passing test attempts themselves have a
  median of 52 ms (p90 2.2 s, max 9 s, across 1,118 attempts).
- **Full lifecycle costs minutes.** Bundle, prep, build, and launch runs take about 70 to 78 s; a Paper check needs a
  re-prep and a rebuild back to Fabric.
- **Model round trips dominate.** For an agent, the cost that matters is model turns. Without a persistent session or
  per-action command, each new question about the UI becomes "write a script or callback, run it, read the result."

Comparison of per-step agent cost (Code, External; not benchmarked side by side):

| Step                          | No package                                                                        | desktop-driver today                                        | agent-device                                |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| Observe                       | Screenshot (~150 ms capture, 1.1k–1.5k image tokens) or a slow System Events walk | `agent describe` (new session each call) or a script        | `snapshot -i` against a warm daemon session |
| Act                           | Coordinate click; re-screenshot to verify                                         | Write and run a script or callback (~4 s)                   | `click @e3` then `snapshot --diff`          |
| Verify                        | Visual judgment                                                                   | `expect` in a callback, or `DesktopAgent.check` in a script | `is checked @e3`, `wait`                    |
| Tool calls per act-and-verify | 2–3, plus vision reasoning                                                        | 2–4, plus authoring code                                    | 1–2                                         |

### 3.5 Reliability and operational friction

Strengths (Code): opaque element IDs with no stale reconstruction, hit-tested clicks, explicit `unsupported operation`,
input locks, deadlines, ownership-safe cleanup, and authenticated story readiness make results trustworthy. An agent
can believe a reported `checked: true`.

Friction observed in agent sessions (workflow activity records, October 2026):

| Friction                                                                                                                       | Effect                                               | Status                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Ad hoc attach needs the application lease from a prior `yarn storybook test --macos`                                           | First attach probe fails with no obvious cause       | Open; documented in memory and skill, not automated                    |
| Stopping the driver process orphans `rnx-cli`, `server-runner`, the app, and the helper, and leaves a stale `interactive.lock` | Next run blocks; manual process cleanup              | Recurred in several sessions; no `stop` command or lock liveness check |
| Fast Refresh of the theme host broke story selection                                                                           | Agent misattributes failures until relaunch          | Open                                                                   |
| Stale Pods after a react-native-macos path change                                                                              | Build fails far from the cause                       | Recovered with clean prep                                              |
| Paper qualification costs bundle, prep, build, and rebuild back to Fabric                                                      | Minutes per renderer check                           | By design (shared DerivedData)                                         |
| `element.takeScreenshot()` returned the whole window                                                                           | Wrong visual evidence                                | Fixed                                                                  |
| Unit mocks passed while real runs exposed WebdriverIO 10 changes                                                               | False confidence                                     | Mitigated by real-platform runs                                        |
| Accessibility actions listed but not invokable                                                                                 | Custom actions (`Toggle`, `Select`) need workarounds | Listing merged (#4426); invocation open                                |

### 3.6 Verified gap: the agent CLI cannot attach

`connectDesktopAgent` and the `agent` CLI never pass `launchMode`, so sessions default to `launch`
(`src/protocol/capabilities.ts`). Storybook registers its target as attach-only
(`storybook-desktop/config/server.cjs`), and `desktop-test` external-ownership targets are attach-only too. Running
the built CLI:

| Target `launchModes` | Result                                                                |
| -------------------- | --------------------------------------------------------------------- |
| `['attach']`         | Exit 1 after 1.66 s: `Target "probe" does not allow launch sessions.` |
| `['launch']`         | Exit 0 after 160 ms, 1,751 bytes of JSON                              |

The only agent-specific CLI therefore cannot reach the app agents most often diagnose. Even with a launch-mode flag,
attach would also need the application lease.

### 3.7 Setup cost

| Requirement          | No package                                                               | desktop-driver                                                                                                   | agent-device (macOS)                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| macOS privacy grants | Accessibility and Screen Recording for the terminal or IDE               | Accessibility and Screen Recording for the responsible process; `doctor --permissions [--prompt]` diagnoses them | Accessibility, Screen Recording, and Input Monitoring; `settings permission grant` opens the pane. `doctor` has no macOS permission check |
| Build                | None                                                                     | Explicit `build-driver`; stable signing identity recommended so grants survive rebuilds                          | Helper built on first use and cached; XCTest needs full Xcode and the runner                                                              |
| Hardware and OS      | Any                                                                      | macOS 14+, Apple silicon                                                                                         | macOS 13+ for the helper                                                                                                                  |
| Repository policy    | `osascript` and unrestricted capture need separate approval (R-PERM-007) | Covered by the approved Yarn workflows                                                                           | Would need its own approval and installation                                                                                              |
| App prerequisites    | Running app                                                              | Registered target; for attach, the application lease; Storybook driver running                                   | Running or installable app; no app changes                                                                                                |
| Visible side effects | Pointer moves                                                            | Pointer moves for physical clicks (AXPress avoids it)                                                            | Automation Mode overlay (XCTest) or a 0.3 s ghost cursor (native)                                                                         |

### 3.8 What changes for an agent

- **Compared with no package,** the driver turns guesses into facts. The agent stops inferring state from pixels and
  coordinates, gets explained click failures, and works inside an approved, target-scoped boundary. The cost is setup
  (signing, grants, a running driver) and, today, a script-writing loop instead of direct commands.
- **Compared with agent-device,** the driver is more precise and more portable, but less ergonomic.
  - **Where agent-device wins:** persistent sessions, refs, compact and diff snapshots, MCP and skills, and session
    recording. These are exactly the features that cut tool calls and tokens.
  - **Where the driver wins:** a desktop-first AX design with physical input and occlusion checks rather than Automation
    Mode; typed state with honest `unsupported`; Storybook awareness; a window-event journal; and one API across
    macOS, Windows, and Win32.
  - **Fit for RN desktop:** for FURN's macOS and Windows targets, agent-device is not a substitute. Its macOS backend
    is still being hardened, and it has no Windows support.
- **Most of the gap is in the interface layer, not the native helper.** Helper operations are fast and the data is
  richer. Adding an agent-shaped front end (§5.1) would combine both strengths.

## 4. Automated testing

### 4.1 Comparison

| Aspect                            | Ad hoc scripts (no package) | desktop-test with storybook-desktop                                                                    | agent-device replay                                              | Appium mac2 (previous FURN approach)               |
| --------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| Protocol and authoring            | `osascript` or custom code  | W3C WebDriver with WebdriverIO 10 and Jasmine; CSF3 `wdio` callbacks in stories                        | `.ad` line DSL, recorded or hand-written; subset of Maestro YAML | W3C WebDriver through the Appium server and XCTest |
| Platforms with one test           | macOS only                  | macOS, Windows, Win32                                                                                  | iOS, Android, TV, web, macOS, Linux; not Windows                 | macOS only (different drivers per platform)        |
| Element model                     | Coordinates or AX scripts   | testID, role, name, text; typed properties; feature flags                                              | Selectors and refs; id demotes to role+label on reused testIDs   | XCUIElement types and predicates                   |
| Input fidelity                    | Any                         | Physical with occlusion check, AXPress, or `auto`; full W3C actions                                    | XCTest or AX; drag needs XCTest                                  | XCTest synthesized events in Automation Mode       |
| Isolation                         | None                        | A fresh worker, session, and remounted story per case                                                  | One session per device; replay resumes from a step               | Per-session                                        |
| Results                           | Exit codes                  | JUnit, `run.json`, `events.jsonl`; separate statuses for infrastructure errors, flakes, and empty runs | JUnit; `REPLAY_DIVERGENCE` with suggestions and resume           | Runner-dependent                                   |
| Failure evidence                  | Manual                      | Window events, then screenshot, source, tree, and other windows                                        | Snapshot, screenshot, logs in `--artifacts-dir`                  | Screenshot and page source                         |
| Lifecycle                         | Manual                      | Bundle, prep, build, launch, and owned cleanup                                                         | `open`, `close`, device claims                                   | Appium server and app path                         |
| CI on macOS                       | Fragile prompts             | Self-hosted or hosted runner with grants; physical clicks can be disabled by policy                    | Documented for mobile (EAS); macOS CI not documented             | Needs `automationmodetool` and Xcode helper grants |
| Turn an agent session into a test | No                          | No (suggestion §5.1)                                                                                   | Yes, `session save-script`, then `.ad` or Maestro export         | No                                                 |
| Visual comparison                 | Manual                      | No                                                                                                     | `diff screenshot --baseline`                                     | Via plugins                                        |

### 4.2 Observed results

- **Legacy FluentTester E2E** moved from Appium to `desktop-test`: macOS Fabric 62/62 locally and on hosted CI, Win32
  201/201, and Windows Fabric 39/39, with no skips or retries. The hosted workflow finished in under 23 minutes.
- **Storybook smoke** on macOS Fabric passed 280/280, including 81 callbacks.
- **Across local Storybook runs:** 1,118 passed, 24 failed, and 40 skipped attempts. Passing attempts have a median of
  52 ms. Failures carry tree, source, screenshot, and window-event evidence.
- **Hosted macOS** runs with physical clicks disabled by target policy (`FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES`).
  `auto` click falls back to AXPress, and keyboard navigation covers controls that do not publish AXPress.

### 4.3 Strengths

- **One test, three desktops.** The same WebdriverIO code runs on macOS, Windows, and Win32; `furn:features` replaces
  platform branches with capability checks and explicit skips.
- **Honest results.** Unsupported states are errors, empty or unmatched runs fail, and statuses distinguish
  infrastructure errors and flakes from product failures.
- **Tests live with the component.** Story callbacks run against a freshly remounted story and are discovered
  statically without entering the native bundle.
- **Evidence on failure.** Window events are captured before anything else disturbs the app, followed by the
  screenshot, source, and tree.
- **Owned lifecycle.** `smoke` and `desktop-test` build, launch, and clean up only what they own.

### 4.4 Gaps

- All-skipped WebdriverIO runs are not yet rejected as coverage (#4342).
- No visual comparison; screenshots are evidence only.
- Physical input is global to the desktop, so runs on one machine are serialized.
- The interactive lock has no stale-owner recovery.
- macOS is Apple silicon only and has no notarized helper, so each CI image or developer machine needs a stable signing
  identity and Accessibility and Screen Recording grants for the right responsible process.
- `helpText` and `required` are unsupported on macOS, and custom accessibility actions cannot be invoked.
- The reliability window for required CI (100 runs over 14 days at 99%) is not yet established (#4349).

## 5. Suggestions

Ordered by expected value. "All" means a change in the Node layer or protocol that benefits macOS, Windows, and Win32.

### 5.1 Agent workflows (all platforms)

1. **Attach-capable agent entry points.** Add `--launch-mode attach|launch` to the agent CLI and `connectDesktopAgent`.
   When the target allows only attach, default to it. Resolve the application lease automatically, or explain how to
   create it. This fixes §3.6 and is a small change.
2. **A persistent agent session.** Add `desktop-driver agent session start|stop` (or a small daemon) that keeps one
   WebDriver session. Then add CLI verbs: `find`, `click`, `type`, `press`, `check`, `wait`, `select-story`, `describe`,
   and `screenshot`. This removes per-call session setup and the need to write scripts. It counts as a new agent
   operation, so per `references/security.md` it needs a security review; keep it to registered targets and loopback.
3. **An MCP server for the same verbs.** Ideally, add these as tools on the Storybook channel server's existing `/mcp`
   so one endpoint covers story selection, docs, inspection, and input. Strip credentials and paths from tool schemas,
   following agent-device.
4. **A compact text tree with refs.** One line per node:
   `@e7 button "Save" #save-button [focused,enabled]`. Add an interactive-only filter, omit rects unless asked, drop
   the story-root metadata name, and return `--json` only on request. Measured target: about 0.7k tokens for the full
   app and tens of tokens for a story, against 9.4k to 14k today. Refs should resolve to the session's element UUIDs
   and fail on stale generations.
5. **Diffs and tails.** Add `describe --diff` against the previous snapshot. Add `window-events --since <cursor>` or
   `--tail N` so agents read only what changed after an action. The journal already records age and duration.
6. **Shorter catalog output.** Add `stories list --format ids` (about 2k tokens instead of 19.5k), plus filters by
   title or tag and a flag to show only stories with tests.
7. **Record to `wdio` callbacks.** Journal agent-session actions and selectors, then emit a CSF3 `wdio` callback or a
   WDIO spec. This turns an exploratory diagnosis into a portable regression test, the desktop equivalent of
   agent-device's `.ad` save-script.
8. **Agent skill and instructions.** Ship a short `SKILL.md` and an `agent-map.yaml` section for the agent verbs:
   observe, act, verify, and stop. Include the 2,000-character limit some MCP clients impose on instructions.
9. **Screenshot ergonomics.** Add `--scale points` (1×) to roughly halve image tokens. Add an option to overlay refs or
   testIDs on the image so vision and AX share identities. Add element-cropped captures by ref.
10. **Logs alongside UI.** Optionally tail Metro and the app's console and native logs into the session, filtered to
    the time of an action. Many diagnoses are "the click worked but JS threw."

### 5.2 Testing and harness (all platforms)

1. **Lifecycle hygiene.** Add a `yarn storybook stop --<platform>` that ends owned processes (`rnx-cli`,
   `server-runner`, app, helper). Add stale-owner liveness checks to the interactive lock, using PID plus start time
   like the lease. Add a `doctor` check that reports orphans. This was the most repeated agent friction.
2. **Finish honest status reporting.** Reject all-skipped WDIO runs (#4342) and report skip reasons by feature.
3. **Invoke accessibility actions.** Add `furn/element/{id}/action/{name}` with input-lock, abort, and stale-element
   handling, and a UIA equivalent (Toggle, ExpandCollapse, Invoke patterns). This removes keyboard workarounds for
   controls without AXPress.
4. **Optional visual baselines.** Add element-scoped, tolerance-based comparisons that are opt-in per story, with
   provenance (DPI, theme, renderer) as #4348 qualifies capture.
5. **Flake tooling.** Add a `--repeat N` mode with per-test pass rates, feeding the 99% reliability window (#4349).
6. **Faster renderer switching.** Use separate DerivedData per renderer so Fabric and Paper builds can coexist and a
   Paper check skips the rebuild back to Fabric.
7. **Keep wire-level features advertised.** Continue gating every new capability through `furn:features` so shared
   tests branch on capability, not platform.

### 5.3 macOS-specific

1. **Signed, notarized helper builds** (#4345), so CI images and developers keep privacy grants across updates without
   managing a local signing identity.
2. **Intel (x86_64) support**, or a documented decision not to support it; the helper is arm64 only today.
3. **`helpText` and `required`.** Map `AXHelp` and the RN accessibility hint, and expose `required` where the RN macOS
   fork publishes it, instead of returning `unsupported operation`.
4. **Alerts, sheets, and menus.** Expose sheets, popovers, the menu bar, and system dialogs (such as permission
   prompts) as selectable windows, with clear ownership rules.
5. **Accessibility notification waits.** Add `wait for event` on the AXObserver stream (for example focus change or
   value change) instead of polling `find` every 25 ms.
6. **Fast Refresh resilience.** Detect the theme-host reload that breaks story selection and report it as an
   infrastructure error, or re-handshake readiness automatically.
7. **Better permission diagnostics.** Name the responsible process that needs the grant (Terminal, VS Code, or the
   agent host), and detect grants lost after an ad hoc rebuild.

### 5.4 What not to copy from agent-device

- XCTest Automation Mode as a default. Its overlay and shared pointer conflict with the driver's physical-input model
  and hosted CI.
- Private SkyLight event APIs. ADR 0031 uses them for some native-backend drags and WKWebView clicks, and they can
  break in any macOS release.
- Cross-application `desktop` and `menubar` surfaces without the target registration and ownership model.

## 6. Sources

**This repository (revision `c84acb741`):**

- `packages/agentic/desktop-driver`: `AGENTS.md`, `README.md`, `references/{architecture,protocol,security,test-integration}.md`,
  `native/macos/README.md`, `native/macos/Sources/DesktopDriverHost/Driver.swift`, `src/agent/DesktopAgent.ts`,
  `src/cli/createDesktopDriverCommand.ts`, `src/protocol/capabilities.ts`, `src/protocol/actions.ts`,
  `src/server/createDesktopDriverServer.ts`, `src/hosts/native/NativeDesktopHost.ts`, `src/storybook.ts`.
- `packages/agentic/desktop-test`: `references/*.md`, `src/supervisor.ts`.
- `packages/agentic/storybook-desktop`: `config/server.cjs`, `references/story-tests.md`,
  `src/cli/DesktopStorybookCli.ts`.
- `apps/storybook/agent-map.yaml`, `apps/storybook/AGENTS.md`, `apps/storybook/artifacts/desktop/*` (61 macOS
  evidence sets and run results).
- `references/agents/repository/permissions.md` (R-PERM-007).
- Issues and PRs: #4342, #4343, #4344, #4345, #4348, #4349, #4397, #4426.

**agent-device and alternatives (External, fetched 2026-11-02):**

- https://github.com/callstack/agent-device (commit `cf9153e19`): README, `docs/adr/0008`, `0012`, `0014`, `0031`,
  `packages/contracts/src/session-surface.ts`, `apple/macos-helper`, `src/mcp`, `skills/`; issues #3213, #2376,
  #3961, #3406.
- https://agent-device.dev/docs/ (commands, snapshots, capabilities, replay-e2e, security-trust, agent-setup).
- https://www.callstack.com/blog/how-we-optimized-agent-device-for-mobile-app-automation
- https://appium.github.io/appium-mac2-driver
- https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/AutomatetheUserInterface.html
- https://github.com/openclaw/peekaboo
- Anthropic and OpenAI computer-use documentation (screenshot and coordinate agents; image token formulas).
