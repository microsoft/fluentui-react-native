# Desktop driver capabilities on macOS

Research into what `@fluentui-react-native/desktop-driver` and
`@fluentui-react-native/desktop-test` (with `storybook-desktop`) give an agent
and an automated test on macOS, compared with working without them and with
Callstack's [`agent-device`](https://github.com/callstackincubator/agent-device).

- **Baseline revision:** `c84acb741` (`main`, 2026-11-02), which includes #4426 (macOS accessibility actions are
  listed). The original report described this revision.
- **Updated revision:** branch `user/jasonvmo/driver-mcp-stage-two` at `41fc7473f` (2026-11-04, draft PR #4434), 55
  commits and 306 files past the baseline. The
  [implementation plan](packages/agentic/desktop-driver/references/remaining-work.md) tracks what remains.
- **Lenses:** agent-driven workflows (an agent diagnosing or exploring a running app) and automated testing.
- **Evidence labels:** **Observed** means measured or run for this report; branch measurements are dated 2026-11-04.
  **Code** means read from source or package references but not executed. **External** means third-party
  documentation. **Estimate** means computed from a model or synthetic data.
- **Change markers:** **[New]** did not exist at the baseline. **[Changed]** behaves differently from the baseline.
  **[Corrected]** was wrong in the original report. **[Unchanged]** was re-checked on the branch and still holds.
  Unmarked text is the original analysis and still applies. External facts about agent-device and other tools were
  not re-researched.

## Summary

- **Raw capability is the driver's strength.** On macOS, desktop-driver gives an agent or test exact control
  identity, accessibility state (focus, checked, expanded, selected, value), hit-tested clicks that name what blocked
  them, a window-event journal, and authenticated Storybook story selection. These are things screenshots and
  `osascript` cannot provide reliably. The driver also refuses to fake unsupported state. **[Changed]** The branch adds
  invocation of published accessibility actions by name, waits driven by accessibility change events, and help and
  required facts in bounded observations.
- **Agent ergonomics were its weakness; on the branch, MCP closes most of that gap.** At the baseline, the agent CLI
  exposed only `describe` and `screenshot`, each call created and deleted a session, the output was pretty-printed
  JSON, and the CLI could not attach to the Storybook target (Observed, §3.6). Agents wrote `wdio` callbacks or attach
  scripts instead, at about 4 s and a code edit per question. **[New]** The `desktop-driver-mcp` adapter exposes six
  tools over twelve bounded operations, keeps one session per connection, and attaches by default.
  `storybook driver --agent` supervises it with a grant and a private descriptor, and on macOS keeps the application
  lease current. Against the live Storybook app, a warm observation took about 30 ms, and one `desktop_act` call
  acted, checked, and re-observed (Observed). **[Unchanged]** The `agent describe|screenshot` CLI still creates a
  session per call and cannot attach.
- **Context cost depends on format, not content.** **[Changed]** This is now measured on the delivered product. At the
  same app state, a complete outline of all 142–150 nodes cost 1.6k–1.9k tokens, against 13.0k–13.6k for the
  pretty-printed `furn/tree`: 86–88% fewer. The default interactive view cost 1.1k–1.3k, a story-scoped view 250–310,
  and an unchanged delta about 150 (Observed). **[Corrected]** The baseline's figures of about 0.7k and 40 tokens were
  synthetic; they left out refs and the ~150-token result envelope. A Retina window screenshot is still roughly 1.1k
  to 1.5k image tokens, but `capture` now returns about 140 tokens of metadata unless pixels are requested.
- **agent-device is the reference design for agent ergonomics.** It has a persistent daemon, `@eN` refs pinned to a
  snapshot generation, interactive-only and diff snapshots, MCP and skills, and record and replay to `.ad` or Maestro.
  It is mobile-first. Its macOS backend defaults to XCTest Automation Mode (a system overlay plus the shared pointer).
  The AX-only native backend is opt-in, has open correctness gaps, and cannot express drag, hold, or double-click.
  It has no Windows support and no W3C WebDriver portability. **[Changed]** The branch now has its own persistent
  session, refs, interactive and diff views, and MCP. Recording, replay, and a shipped skill remain agent-device
  advantages.
- **For automated testing, desktop-test is the stronger fit here.** The same WebdriverIO tests run on macOS, Windows,
  and Win32. Statuses are honest, failure evidence is ordered, lifecycle is owned, and tests live with their stories.
  Proven results: legacy E2E 62/62 on macOS and Storybook smoke 280/280. agent-device replay is better for turning an
  exploratory agent session into a regression script, but it does not cover Windows. **[Changed]** All three CLIs
  gain machine-readable reporter modes. The WDIO surface is otherwise unchanged and cannot invoke named accessibility
  actions.
- **Top suggestions (status on the branch).** Done or done differently: a persistent agent session (as MCP, not a CLI
  daemon); a compact text tree with refs, view filters, and diffs; invoking accessibility actions; and paged catalog
  output. Partly done: attach by default with automatic lease handling (MCP yes, CLI no) and screenshot ergonomics.
  Still open: `stop`, orphan cleanup, and stale-lock recovery; window-event tails; exporting agent sessions as `wdio`
  callbacks; and a shipped agent skill (§5).

## Changes since the baseline

| Area                  | Baseline (`c84acb741`)                                           | Branch (`41fc7473f`)                                                                                                                                                                                                                                                                                                                                       | Evidence               |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Agent interface       | `agent describe\|screenshot` CLI, `DesktopAgent`, WDIO scripts   | **[New]** MCP adapter `@fluentui-react-native/desktop-driver-mcp` with `desktop_session`, `desktop_observe`, `desktop_act`, `desktop_check`, `desktop_capture`, and `desktop_story`. One session per MCP connection, attaching unless `launch` is set. **[Unchanged]** The CLI and `DesktopAgent`.                                                         | Code, Observed         |
| Operations            | WebDriver routes, `furn/tree`, page source, `furn/window-events` | **[New]** Twelve bounded operations under `/session/{id}/furn/ops`: reads `observe`, `observeDelta`, `observePage`, `find`, `check`, `capture`, `artifact`, `stories`, and `journal`; mutations `act`, `sequence` (up to eight steps and a closing observe), and `story`. **[Changed]** `/client` gains a typed method per operation and a `grant` option. | Code                   |
| Observation format    | Pretty JSON tree; element UUIDs only through WDIO                | **[New]** A text outline with opaque refs that stay valid across observations and fail with a specific reason. Views `interactive`, `content`, and `all`; budgets that are rejected, never clamped; explicit `complete` and `truncation`; cursor paging and deltas over retained samples.                                                                  | Code, Observed         |
| Waits                 | Scripts poll `find` every 25 ms                                  | **[New]** `check` waits up to 30 s, re-evaluating on provider change events with a 100 ms to 1 s backoff.                                                                                                                                                                                                                                                  | Code                   |
| Accessibility actions | Listed only (#4426)                                              | **[New]** `act` `perform` invokes a published action by name. On the Storybook checkbox, `Toggle` worked where `activate` was refused for lacking AXPress. Operations only; WDIO has no route.                                                                                                                                                             | Observed               |
| Mutation safety       | Deadlines and abort signals                                      | **[New]** Every failed mutation reports its `effect`; one that may have landed quarantines the target, with optional persisted recovery. A repeated `requestId` replays the recorded outcome (256 kept).                                                                                                                                                   | Code                   |
| Service authority     | Loopback only; browser `Origin` rejected                         | **[New]** With a `DesktopAuthority`, every route needs a grant: unauthenticated `/status` and `newSession` get 401. Sessions belong to one grant and close after 10 idle minutes. WDIO accepts a `grant`. Agents find the service through a private descriptor checked against the helper's identity.                                                      | Code, Observed         |
| Supervisors           | `storybook driver`, `desktop-test serve --json`                  | **[New]** `storybook driver --agent` and `desktop-test serve --agent` publish the descriptor. Under `--agent`, Storybook's own `/mcp` returns 404, and on macOS the application lease stays current.                                                                                                                                                       | Observed               |
| CLI output            | Pretty JSON; `--json` only in desktop-test                       | **[New]** `--reporter auto\|plain\|github-actions\|json\|ndjson` and `--json` on `desktop-driver`, `desktop-test`, and `storybook-desktop`; `json` is minified.                                                                                                                                                                                            | Code                   |
| Features              | Ten advertised features                                          | **[New]** `boundedObservation` and `performAccessibilityAction`; the macOS helper advertises both.                                                                                                                                                                                                                                                         | Code                   |
| macOS helper          | Full tree reads                                                  | **[Changed]** Bounded observation reads `AXHelp` and `AXRequired` and names unavailable facts once in `unsupportedFacts`. Memory stayed flat (+32 KiB RSS over 500 observations), a hung app fails a read in about 1.5 s with `target-non-response`, and event overflow is reported as `eventsTruncated`.                                                  | Code, Observed         |
| Windows               | UIA through the same WebDriver API                               | **[Changed]** Windows and Win32 attach by verified AUMID or REX executable identity. Windows Fabric and Win32 Paper passed the real-app observation checks and `desktop_story`; the Win32 fixture passed at 100% and 150% scale.                                                                                                                           | Code (Windows records) |

**Still open on the branch** (Code, from the plan unless marked):

- **[Unchanged]** The agent CLI has no launch-mode or grant option and still creates a session per call.
- **[Unchanged]** No `stop` command. A killed supervisor orphans Metro, the server runner, and the helper, and the
  interactive lock has no stale-owner check. SIGINT stops everything and releases the lock.
- **[Unchanged]** `furn/window-events` returns the whole ring, with no tail or cursor.
- **[New]** The Storybook runtime bridge does not reconnect after a driver restart, so the app reports
  `story-not-ready` until it is relaunched (Observed).
- **[New]** The Storybook channel's `/select-story-sync` route is unauthenticated whenever WebSockets are on. Another
  local client can change the story; `stories` detects this and expires refs, but `observe` and `find` do not yet.
- **[Unchanged]** Recording and replay, `wdio` export, logs, visual comparison, screenshot point scaling, and an
  agent skill or `agent-map.yaml` section for the MCP tools.
- **[Unchanged]** Issues #4342, #4345, #4348, and #4349 are open; macOS remains Apple silicon only.
- Windows Fabric renderer, DPI, live-transition, and menu-popup lanes remain open (plan M6).

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
- **Not done at the baseline.** No live macOS app session was started for the original report, so its latencies come
  from recorded runs. `osascript` and unrestricted screen capture were not exercised because the repository requires
  separate authorization for them (R-PERM-007).
- **[New] Branch measurement (Observed, 2026-11-04).** At `41fc7473f`, `yarn storybook driver --macos --agent` served
  the macOS Fabric Storybook app (2720×1988-pixel window). An MCP SDK client connected to `desktop-driver-mcp` over
  stdio and rendered `components-button--default`, `components-checkbox--default`, and `components-menu--default`,
  each confirmed by its story marker. At each story it measured the baseline formats (`furn/tree`, page source,
  `furn/window-events`) and the new tool results at the same app state, so old and new compare directly. Tokens use
  the same `o200k_base` tokenizer over every text block the client receives. Latencies are client-side medians of
  20 warm calls per story. Windows results come from the plan's recorded Windows runs and were not repeated here.
  agent-device was still not run.

## 2. What the packages provide on macOS

### 2.1 Layers

Lines marked `[New]` or `[Changed]` differ from the baseline.

```text
agent or test code
 ├─ MCP     desktop-driver-mcp: desktop_session, _observe, _act, _check, _capture, _story      [New]
 ├─ /client DesktopSessionClient: one typed method per bounded operation, grant option         [Changed]
 ├─ /wdio   connectDesktopWebdriver, attachDesktopWebdriver (WebdriverIO 10), grant option     [Changed]
 ├─ /agent  DesktopAgent: find, click, type, check, describe, screenshot, runStoryTest
 ├─ CLI     desktop-driver: agent describe|screenshot, stories list|explain|run, doctor, build-driver;
 │          --reporter auto|plain|github-actions|json|ndjson                                    [Changed]
 ├─ desktop-test       config, lifecycle (bundle/prep/build/run), suites, statuses, artifacts;
 │                     serve --agent                                                          [New]
 └─ storybook-desktop  story manifest, authenticated story selection, wdio callbacks, smoke;
                       driver --agent                                                         [New]
        │ private connection descriptor and grant                                            [New]
        │ W3C WebDriver Classic and furn/ops bounded operations over loopback HTTP            [Changed]
desktop-driver server (Node): grants, sessions, policy, selectors, operations, settlement and quarantine,
                              evidence, input queues                                          [Changed]
        │ FDR1 framed stdio
macOS helper (Swift, LSUIElement): AXUIElement, Quartz Event Services, ScreenCaptureKit, AXObserver;
                                   bounded observation, named action invocation               [Changed]
```

### 2.2 Driver capabilities (Code, verified against the Swift helper and server)

| Area                 | macOS behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sessions             | `launch` or `attach` to a server-registered target. One active session per target. Attach needs exact identity and a nonce-bound application lease. Clients cannot supply executables, paths, or environment. **[New]** A service with a `DesktopAuthority` requires a grant on every route, binds each session to its grant, and closes a session after 10 idle minutes. Under `storybook driver --agent`, macOS keeps the lease current.                                                                                                |
| Lookup               | `accessibility id` (testID), `tag name` (normalized role), `link text` and `partial link text` (accessible name), `-furn:text`. No XPath, CSS, or script execution. Element IDs are opaque UUIDs; stale elements are never reconstructed. **[New]** Operations add opaque `<tag><serial>` refs that stay valid across observations and fail with a reason such as `ref-region-changed`, and `find` returns `unique`, `none`, `multiple`, or `inconclusive`.                                                                               |
| State                | `testID`, name/label, role, value, `focused`, `enabled`, `checked`, `expanded`, `selected`, displayed, rect, and `accessibilityActions` (names only, #4426). **[Changed]** The WebDriver `helpText` and `required` properties still return `unsupported operation`, never a fabricated `false`, but bounded observation reads `AXHelp` and `AXRequired` and names unavailable facts once in `unsupportedFacts`.                                                                                                                           |
| Click                | `furn:clickMode` of `physical` (Quartz event after a hit test; `element click intercepted` names the occluding element or foreign app and PID), `accessibility` (AXPress), or `auto` (physical, falling back to AXPress when physical input is unavailable or disabled by target policy). **[New]** The `act` operation adds `activate` (semantic activation) and `perform` (a published accessibility action by name, refusing names the element does not publish exactly once).                                                         |
| Keyboard and pointer | W3C actions with key, pointer, wheel, and pause sources; a pressed-key ledger supplies modifier flags; element clear and send keys. **[New]** `act` adds `type` and `clear` by ref or selector.                                                                                                                                                                                                                                                                                                                                           |
| Windows              | Handles, switching (moves key-window status), activation, read and set rect where AX allows.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Capture              | Window and element screenshots through ScreenCaptureKit in backing pixels. Needs Screen Recording; without it the screenshot features are not advertised. Minimized or off-screen windows fail. **[New]** `capture` keeps PNGs as session artifacts (16 most recent, 32 MiB) with size, scale factor, and SHA-256, and returns pixels only when asked.                                                                                                                                                                                    |
| Inspection           | `furn/tree` (JSON tree), page source (XML), and `furn/window-events`: a 512-entry AXObserver ring plus a 128-entry command journal with age and duration. **[New]** `observe`, `observeDelta`, and `observePage` (§3.3), and a paged 500-entry operation `journal` that never holds typed text. **[Unchanged]** `furn/window-events` still returns the whole ring.                                                                                                                                                                        |
| Storybook            | `furn/manifest`, `furn/story`, `furn/story/reset`, `furn/story/args`; readiness is authenticated by nonce, run ID, plan digest, preview generation, and a story-root marker. **[New]** `stories` pages and filters the catalog and notices stories rendered by other clients; `story` selects or resets with marker verification and request-id replay. Operations cannot set args yet.                                                                                                                                                   |
| Safety               | Loopback only and browser `Origin` rejected. Commands are serialized per session, and physical input takes a cross-process per-user lock. Every native call has a deadline and abort signal. After a helper crash, a release-only mode lets up held keys and buttons. Cleanup touches only resources it owns. **[New]** Every failed mutation reports its `effect`; a target whose mutation may have landed is quarantined, optionally persisted for operator recovery. A content policy of `deny` withholds application text and pixels. |
| Diagnostics          | `doctor --permissions [--prompt]` reports Accessibility, PostEvent, Screen Recording, signing (cdhash), and console-session state. A locked screen or non-console session fails fast with `input-unavailable`. **[New]** A bounded read of a hung app fails in about 1.5 s with `target-non-response` (measured against Calculator and Font Book).                                                                                                                                                                                        |
| Platform             | macOS 14+, Apple silicon only. Ad hoc signing loses privacy grants on rebuild; a stable identity is configured with `FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`. No Developer ID or notarized build yet (#4345). Helpers are built explicitly; installation never compiles or downloads. **[Unchanged]**                                                                                                                                                                                                                                 |

`furn:features` advertises `accessibilityActions`, `accessibilityClick`, `elementScreenshot`, `focus`, `keyboard`,
`physicalClick`, `screenshot`, `setWindowRect`, `wheel`, and `windowEvents`, so tests and agents can branch on real
capability instead of on platform. **[New]** The branch adds `boundedObservation` and `performAccessibilityAction`, and
the macOS helper advertises both.

### 2.3 Harness capabilities (Code)

- **`desktop-test`:** `desktop.config.mts` (`defineDesktopConfig`, schema 1) declares installed, React Native Test App,
  or REX targets for macOS, Windows, and Win32. Commands cover `build-driver`, `bundle`, `prep`, `build`, `run`,
  `test --suite <name> [--list]`, and `serve --json`. WebdriverIO and Jasmine own sessions, hooks, and retries.
  **[New]** `serve --agent` protects the registered target with an authority, issues one target-scoped grant, and
  publishes the private descriptor; `--reporter` selects the output mode.
- **Results:** Each run writes `artifacts/desktop/<run-id>/` with `events.jsonl`, `run.json`, `junit.xml`, and redacted
  command logs. Statuses separate passed, failed, skipped, timed-out, cancelled, infrastructure-error, flaky, and
  incomplete. Empty, unmatched, or all-skipped runs are not passes (R-DTEST-001; the WDIO all-skipped case is #4342).
- **`storybook-desktop`:** Stories carry top-level CSF3 `wdio` callbacks. Each named case runs in its own Node worker
  and WebDriver session against a freshly remounted preview, with `browser`, `expect`, typed `desktop` helpers,
  `platform`, an abort `signal`, and `skip(reason)`. Failure evidence is captured window events first, then
  `failure.png`, source XML, tree JSON, and up to four other windows. `smoke` owns the whole app lifecycle; `test` runs
  against an already running app. **[Unchanged]** Callbacks still use WebdriverIO only and cannot call the bounded
  operations. **[New]** `driver --agent` serves the agent connection described in §2.4.
- **Storybook MCP:** The Storybook channel server enables upstream `@storybook/react-native` MCP at `/mcp` (story
  selection and documentation tools). It does not expose driver inspection or input. **[Changed]** While
  `driver --agent` serves an agent connection, `/mcp` returns 404 so story selection goes through the driver.

### 2.4 The agent surface

| Path                                                                                                            | What an agent gets                                                                                                                                                             | Limits                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[New]** `desktop-driver-mcp` over stdio, served by `storybook driver --agent` or `desktop-test serve --agent` | Six tools over the bounded operations; one persistent session per MCP connection that attaches by default; progress and cancellation; captures as hash-verified resource links | Needs a cached, verified helper and a running `--agent` supervisor; the adapter never builds or launches anything. The tool list costs about 4.7k tokens once per connection (Observed, §3.3). The runtime bridge does not reconnect after a driver restart.                      |
| `desktop-driver agent describe` / `agent screenshot`                                                            | Bounded tree (`depth` 3, `maxNodes` 100, `story` or `application` scope) or a screenshot file                                                                                  | Only these two operations. Each call creates and deletes a WebDriver session. No launch-mode option, so it fails against attach-only targets such as Storybook (Observed, §3.6). **[Unchanged]** It also has no grant option, so a protected `--agent` service refuses it (Code). |
| `desktop-driver stories list`, `explain`, `run`                                                                 | Story catalog and story test execution                                                                                                                                         | Pretty-printed manifest JSON, about 19.5k tokens for the 209-story catalog (Estimate, §3.3). **[Changed]** `--reporter json` minifies it; the `stories` operation pages it at 637 tokens per 25 stories (Observed).                                                               |
| `/agent` `DesktopAgent` in a Node script                                                                        | `find`, `click`, `type`, `check`, `describe`, `screenshot`, `runStoryTest`                                                                                                     | The agent must write and run a script. `connectDesktopAgent` defaults to `launch`. **[Corrected]** It accepts `launchMode`; only the CLI omits it (§3.6). **[Unchanged]** It does not use the bounded operations.                                                                 |
| **[Changed]** `/client` `DesktopSessionClient` in a Node script                                                 | Typed calls to every bounded operation and WebDriver command                                                                                                                   | The agent writes a script and supplies a grant for a protected service.                                                                                                                                                                                                           |
| `/wdio` `attachDesktopWebdriver` in a Node script                                                               | All of WebdriverIO                                                                                                                                                             | Needs the application lease that `yarn storybook test --macos` writes; the agent writes code. **[Changed]** Accepts a `grant`; under `storybook driver --agent` on macOS the lease is kept current, so no prior `storybook test` run is needed.                                   |
| `yarn storybook test --macos --test <glob>` with a `wdio` callback                                              | Full WebdriverIO in an isolated worker, fresh preview, failure evidence                                                                                                        | About 4 to 4.6 s per single-test run (Observed). Requires editing the story file and restarting the driver and reloading the app when callbacks change.                                                                                                                           |
| Storybook MCP `/mcp`                                                                                            | Story selection and documentation                                                                                                                                              | No element tree, state, or input. **[Changed]** Returns 404 while `driver --agent` serves an agent.                                                                                                                                                                               |

In practice, agents in the workflow records diagnosed the macOS app by writing `wdio` callbacks or ad hoc attach
scripts, not through the `agent` CLI. **[Changed]** On the branch, the MCP adapter is the intended agent path; those
records predate it.

## 3. Agent-driven workflows

The three baselines:

- **No package.** The agent uses `screencapture`, `osascript` (System Events UI scripting and AX attributes), and
  coordinate-click tools. This needs Accessibility and Screen Recording grants for the terminal and, in this
  repository, separate authorization (R-PERM-007).
- **desktop-driver.** Through the paths in §2.4. **[Changed]** The comparison below marks what the branch adds to the
  baseline.
- **agent-device.** A Node CLI with a persistent daemon, MCP server, and typed client, built for agents. On macOS it
  has two backends (External, ADR 0031):
  - **XCTest (the default for the `app` surface).** Uses the XCUITest runner. This puts the Mac in Automation Mode,
    which shows a system overlay and moves the real shared pointer. It is the same mechanism as Appium mac2.
  - **Native (opt-in).** A Swift helper that uses only the accessibility (AX) API and ScreenCaptureKit
    (`AGENT_DEVICE_MACOS_APP_BACKEND=native`). It refuses drag, hold, double-click, secondary click, gestures, and
    recording. It also has open gaps, tracked in issue #3213.

  The `desktop`, `frontmost-app`, and `menubar` surfaces always use the AX helper.

### 3.1 Raw capabilities

| Capability                                     | No package (screenshots, `osascript`, coordinates)                 | desktop-driver on macOS                                                                                                                                | agent-device on macOS                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Find a control by testID                       | No; System Events sees AX identifiers only through verbose scripts | Yes, `~testID`, with strict multi-match errors in WDIO. **[New]** `find` reports `unique`, `none`, `multiple`, or `inconclusive`                       | Yes, `id=` selector or `@eN` ref                                                                             |
| Read focus, checked, expanded, selected, value | Partly, through AX attribute scripts; visually otherwise           | Yes, typed properties; unsupported values are errors. **[New]** Observations add help and required facts                                               | Yes, `is focused`, `get attrs`, and snapshot state                                                           |
| Stable handles across steps                    | None (coordinates)                                                 | Opaque element UUIDs within a session. **[New]** Outline refs that stay valid across observations and fail with a reason when their region is replaced | `@eN~sG` refs that fail if the tree generation changed                                                       |
| Click                                          | Coordinates, so 1× vs 2× scale mistakes; System Events `click`     | Hit-tested physical click with an occluder report, AXPress, or `auto` fallback. **[New]** `activate`                                                   | XCTest click (overlay, shared pointer) or AX action; native refuses pointer actions without an AX equivalent |
| Double-click, drag, hold, wheel, key chords    | Coordinate tools only                                              | W3C actions: key, pointer, wheel, and pause sources (WDIO only)                                                                                        | XCTest backend only for drag, hold, and double-click                                                         |
| Custom accessibility actions                   | Possible with `perform action` scripts                             | **[Changed]** Invokable by name through `act` `perform` (operations and MCP; not WDIO)                                                                 | Listed in `snapshot --actions` (External)                                                                    |
| Window rect and switching                      | `osascript`                                                        | Yes (where AX allows)                                                                                                                                  | No window management commands                                                                                |
| Event history                                  | None                                                               | 512-entry AX observer ring plus 128-entry command journal. **[New]** Paged 500-entry operation journal without typed text                              | Session `events.ndjson` journal of agent actions                                                             |
| Snapshot diff                                  | No                                                                 | **[New]** `observeDelta` against a retained sample: added, changed, and removed elements                                                               | Yes, Myers diff with fresh refs                                                                              |
| Wait for a condition                           | Poll screenshots                                                   | **[New]** `check` with `waitMs`, re-evaluated on accessibility change events                                                                           | `wait`                                                                                                       |
| Storybook story navigation                     | Click through the sidebar                                          | `furn/story` with authenticated readiness. **[New]** `desktop_story` lists, filters, renders, and resets                                               | None built in (Storybook MCP could be added separately)                                                      |
| React Native tooling                           | None                                                               | None (Storybook MCP serves docs only)                                                                                                                  | `metro reload`, React DevTools tree, inspect, and profile, LogBox dismissal; macOS use unverified            |
| Logs, network, performance                     | None                                                               | Command logs only in desktop-test                                                                                                                      | `logs`, `network dump`, `perf`, CDP memory (mostly mobile)                                                   |
| Scope of authority                             | Any app the terminal is granted                                    | Registered target only; loopback; global input lock. **[New]** Grant-scoped targets and sessions, discovered through a verified private descriptor     | Session app on `app`; all apps on `desktop` and `menubar`; authenticated loopback daemon                     |
| Agent interface                                | Shell                                                              | **[Changed]** MCP tools and typed client, plus the two CLI commands, Node API, and WDIO                                                                | CLI, MCP tools, skills, typed client                                                                         |
| Windows and Win32                              | Different tooling                                                  | Same API through UIA. **[New]** Same operations and MCP tools, with identity-based attach                                                              | Not supported                                                                                                |

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
- **[New] Honest effects and safe retries.** A failed mutation reports whether it took effect, an uncertain one
  quarantines the target instead of letting later work overtake it, and a repeated `requestId` returns the first
  outcome instead of acting twice. A screenshot-and-click loop cannot tell an agent whether a timed-out click landed.

### 3.3 Context cost

**Baseline.** Median per-observation sizes from the 61 macOS evidence sets (Observed unless marked):

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

**[New] Branch measurement at one app state (Observed, 2026-11-04).** Ranges cover the button, checkbox, and menu
stories (§1). Every observation was complete, with no truncation.

| Result                                         | Tokens        | Notes                                                                                                                   |
| ---------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `furn/tree`, pretty JSON                       | 12,972–13,643 | 63–67 KB; 142–150 nodes. Within 10% of the baseline median.                                                             |
| `furn/tree`, minified                          | 7,102–7,469   |                                                                                                                         |
| Page source XML                                | 6,244–6,562   |                                                                                                                         |
| `furn/window-events`                           | 5,331–5,352   | **[Unchanged]** Still the whole ring.                                                                                   |
| `desktop_observe`, `all` view                  | 1,602–1,859   | The same 142–150 nodes as the tree: 86–88% fewer tokens than pretty JSON and 74–78% fewer than minified.                |
| `desktop_observe`, `all` view as JSON nodes    | 3,290–3,375   | JSON on request.                                                                                                        |
| `desktop_observe` default (`interactive` view) | 1,122–1,304   | 74–76 elements, about 90% fewer tokens than pretty JSON.                                                                |
| `desktop_observe`, `content` view              | 1,199–1,373   | 79–80 elements.                                                                                                         |
| `desktop_observe` within the story root        | 252–311       | 2–6 elements.                                                                                                           |
| `delta`, nothing changed                       | 149–150       |                                                                                                                         |
| `delta`, one element changed                   | 192           | After toggling the checkbox.                                                                                            |
| `find` the story root                          | ~200          |                                                                                                                         |
| `find` `role: button`                          | ~490          | Outcome `multiple`.                                                                                                     |
| `check`                                        | ~81           |                                                                                                                         |
| `capture` without `image`                      | ~140          | Metadata, resource link, and SHA-256 for the 2720×1988 PNG. Requesting the image costs the same image tokens as before. |
| `journal`, default page of 50                  | ~3,570        |                                                                                                                         |
| `stories`, first page of 25                    | 637           | All 209 stories, in three pages of 100, cost 5,429.                                                                     |
| `tools/list`                                   | 4,688         | 20,269 bytes for six tools, once per connection. Server instructions add 120.                                           |

Each result carries an envelope of about 150 tokens (schema version, request ID, session, sample, budgets, and
counts), which dominates small results. An outline line looks like
`checkbox "Checkbox" y6fh4 #agentic-storybook-checkbox unchecked collapsed`.

**[Corrected]** The baseline's compact-outline figures (824 tokens for all named nodes, 683 interactive, 39 for a
story) were synthetic. The delivered outline costs about twice as much: each line carries a ref, scroll areas list
their `actions=`, and every result has the envelope. It still meets the plan's target of at least 70% fewer tokens
than an equivalent complete observation. The one-time tool list (20.3 KB) is well above the plan's proposed 8 KiB
starting budget; a test bounds it at 22 KB.

Illustrative cost of a five-observation diagnosis loop (Estimate, from the sizes above):

| Observation format                                         | Five observations                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Full tree JSON as stored (baseline median)                 | ~71k tokens                                                    |
| **[New]** Pretty `furn/tree` at the measured state         | ~65k–68k tokens                                                |
| Window screenshots                                         | ~5.5k–7.7k image tokens, with no element identities            |
| Compact interactive outline (baseline Estimate)            | ~3.4k tokens                                                   |
| **[New]** `desktop_observe`, then four `delta` calls       | ~1.7k–2.1k tokens, plus the 4.7k tool list once per connection |
| Story-scoped `agent describe`                              | ~1.1k tokens                                                   |
| **[New]** Story-scoped `desktop_observe`, then four deltas | ~0.9k–1.1k tokens                                              |
| Story-scoped compact outline (baseline Estimate)           | ~0.2k tokens                                                   |

The content an agent needs is small; at the baseline, the format was not. A story-scoped describe was already cheap,
but the `application` scope, stored evidence, and `stories list` were 10 to 20 times larger than a compact outline of
the same information. **[Changed]** Through MCP, the format is no longer the main cost: a full-window observation is
about 1.2k tokens and a repeat observation about 150. The baseline formats keep their sizes and remain the WDIO
failure evidence. **[Unchanged]** The story root's accessible name still carries readiness JSON
(`{"previewGeneration":…,"runId":…,"storyId":…}`), which is noise for an agent and appears in every story-scoped
result.

**Against agent-device (External and Estimate).** agent-device's default output is close to the compact outline
above: one text line per node with an `@eN` ref, `-i` for interactive only, `-d` and `-s` for depth and scope,
off-screen summaries, and `snapshot --diff`. Callstack reports 12 snapshot reads costing about 5k tokens, roughly the
cost of three screenshots. They also report a debugging session falling from about 150k to 69k tokens after these
optimizations. **[Changed]** The driver now has the same shape: 12 observations as one `desktop_observe` and eleven
deltas would cost roughly 2.8k–3.4k tokens on the measured app (Estimate). The two were not measured against the same
app. The driver's advantage remains precision: typed states, rects when asked for, explicit completeness, and a
journal that explains _why_ something changed.

### 3.4 Latency and round trips

**Baseline.** Helper-side command latency (Observed, from command journals):

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

**[New] Branch measurement (Observed, 2026-11-04).** Client-side MCP calls over stdio against the agent-served
Storybook app, so each includes the MCP, HTTP, and helper hops:

| Call                                                              | Median                      | Tail      |
| ----------------------------------------------------------------- | --------------------------- | --------- |
| `desktop_observe`, default view (20 warm calls per story)         | 29–31 ms                    | max 35 ms |
| `desktop_observe` `delta` (20 warm calls per story)               | 32–35 ms                    | max 37 ms |
| `desktop_act`: physical click, then `check` checked               | 181 ms (one run)            |           |
| `desktop_act`: `perform` `Toggle`, `check`, and a closing observe | 48 ms (one run, 386 tokens) |           |

- **Native operations are not the bottleneck.** Most are under 150 ms. **[New]** A bounded observation of the whole
  window took about 30 ms end to end, below the baseline's 58 ms helper-side median for a full `tree` (different app
  states).
- **Per-invocation overhead is.** Each `agent` CLI call starts Node, creates a session, and deletes it: 160 ms against
  the fake host as a lower bound, and the failing attach-only call took 1.66 s to exit (Observed). **[Changed]** The
  MCP session persists across calls, so this overhead is paid once per connection. **[Unchanged]** The CLI still pays
  it on every call.
- **Authored callbacks are slower still.** A single-test `yarn storybook test` run takes about 4 to 4.6 s wall time,
  plus the edit, driver restart, and app reload when the callback changes. Passing test attempts themselves have a
  median of 52 ms (p90 2.2 s, max 9 s, across 1,118 attempts).
- **Full lifecycle costs minutes.** Bundle, prep, build, and launch runs take about 70 to 78 s; a Paper check needs a
  re-prep and a rebuild back to Fabric.
- **Model round trips dominate.** For an agent, the cost that matters is model turns. At the baseline, without a
  persistent session or per-action command, each new question about the UI became "write a script or callback, run
  it, read the result." **[Changed]** Through MCP, an act, its check, and a fresh observation take one tool call.

Comparison of per-step agent cost (Code, External; not benchmarked side by side):

| Step                          | No package                                                                        | desktop-driver CLI and scripts (baseline, **[Unchanged]**)  | **[New]** desktop-driver MCP                                                                          | agent-device                                |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Observe                       | Screenshot (~150 ms capture, 1.1k–1.5k image tokens) or a slow System Events walk | `agent describe` (new session each call) or a script        | `desktop_observe` on a warm session (~30 ms; ~1.2k tokens for the window, ~0.3k for a story)          | `snapshot -i` against a warm daemon session |
| Act                           | Coordinate click; re-screenshot to verify                                         | Write and run a script or callback (~4 s)                   | `desktop_act` with `click`, `activate`, `perform`, `type`, or `clear`, by ref or selector             | `click @e3` then `snapshot --diff`          |
| Verify                        | Visual judgment                                                                   | `expect` in a callback, or `DesktopAgent.check` in a script | A `check` step in the same `desktop_act`, or `desktop_check` with `waitMs`; then a ~150-token `delta` | `is checked @e3`, `wait`                    |
| Tool calls per act-and-verify | 2–3, plus vision reasoning                                                        | 2–4, plus authoring code                                    | 1 (Observed)                                                                                          | 1–2                                         |

### 3.5 Reliability and operational friction

Strengths (Code): opaque element IDs with no stale reconstruction, hit-tested clicks, explicit `unsupported operation`,
input locks, deadlines, ownership-safe cleanup, and authenticated story readiness make results trustworthy. An agent
can believe a reported `checked: true`. **[New]** Settled mutation effects, quarantine, idempotent request IDs,
explicit observation completeness, and grant-scoped sessions extend that trust to persistent agent sessions.

Friction observed in agent sessions (workflow activity records, October 2026, plus branch work in November 2026):

| Friction                                                                                                                       | Effect                                                                                               | Status on the branch                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ad hoc attach needs the application lease from a prior `yarn storybook test --macos`                                           | First attach probe fails with no obvious cause                                                       | **[Changed]** Solved for agents: `storybook driver --agent` keeps the macOS lease current. Plain `driver` and ad hoc WDIO attach still need it.                    |
| Stopping the driver process orphans `rnx-cli`, `server-runner`, the app, and the helper, and leaves a stale `interactive.lock` | Next run blocks; manual process cleanup                                                              | **[Unchanged]** No `stop` command or lock liveness check. SIGINT stops everything and releases the lock; a killed supervisor still orphans its children (plan M2). |
| Fast Refresh of the theme host broke story selection                                                                           | Agent misattributes failures until relaunch                                                          | Open; not re-checked on the branch                                                                                                                                 |
| Stale Pods after a react-native-macos path change                                                                              | Build fails far from the cause                                                                       | Recovered with clean prep                                                                                                                                          |
| Paper qualification costs bundle, prep, build, and rebuild back to Fabric                                                      | Minutes per renderer check                                                                           | By design (shared DerivedData)                                                                                                                                     |
| `element.takeScreenshot()` returned the whole window                                                                           | Wrong visual evidence                                                                                | Fixed                                                                                                                                                              |
| Unit mocks passed while real runs exposed WebdriverIO 10 changes                                                               | False confidence                                                                                     | Mitigated by real-platform runs                                                                                                                                    |
| Accessibility actions listed but not invokable                                                                                 | Custom actions (`Toggle`, `Select`) need workarounds                                                 | **[Changed]** Invokable through `act` `perform`; `Toggle` worked on the Storybook checkbox (Observed). Not available through WDIO.                                 |
| **[New]** The Storybook runtime bridge does not reconnect after a driver restart                                               | `story-not-ready` until the app is relaunched; `yarn storybook run` only reactivates the running app | Open (plan M5)                                                                                                                                                     |
| **[New]** The Storybook checkbox publishes only the custom `Toggle` action, not AXPress                                        | `activate` is refused with `unsupported operation` and effect `none` (Observed)                      | Honest refusal; use `perform` or a physical click                                                                                                                  |

### 3.6 Verified gap: the agent CLI cannot attach

**[Unchanged]** for the CLI on the branch. The baseline report said that `connectDesktopAgent` and the `agent` CLI
never pass `launchMode`, so sessions default to `launch` (`src/protocol/capabilities.ts`). **[Corrected]**
`connectDesktopAgent` accepts `launchMode` (its options extend the WDIO connection options) and forwards it as
`furn:launchMode`; only its default is `launch`. The CLI's `agent describe` and `agent screenshot` never pass it.
Storybook registers its target as attach-only (`storybook-desktop/config/server.cjs`), and `desktop-test`
external-ownership targets are attach-only too. Running the built CLI at the baseline:

| Target `launchModes` | Result                                                                |
| -------------------- | --------------------------------------------------------------------- |
| `['attach']`         | Exit 1 after 1.66 s: `Target "probe" does not allow launch sessions.` |
| `['launch']`         | Exit 0 after 160 ms, 1,751 bytes of JSON                              |

The only agent-specific CLI therefore cannot reach the app agents most often diagnose. Even with a launch-mode flag,
attach would also need the application lease. **[Unchanged]** On the branch, the CLI also has no grant option, so a
service started with `--agent` refuses it before the launch-mode check (Code). The plan fixes CLI attach handling
without adding a CLI daemon (M5).

**[New]** The MCP adapter is the attach-capable agent path. `desktop_session` `open` attaches unless `launch` is
true, the grant comes from the private descriptor, and on macOS `storybook driver --agent` keeps the lease current.
Against the Storybook app, it attached with no prior `storybook test` run (Observed).

### 3.7 Setup cost

| Requirement                  | No package                                                               | desktop-driver                                                                                                                                                                                                                                                             | agent-device (macOS)                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| macOS privacy grants         | Accessibility and Screen Recording for the terminal or IDE               | Accessibility and Screen Recording for the responsible process; `doctor --permissions [--prompt]` diagnoses them. **[Unchanged]**                                                                                                                                          | Accessibility, Screen Recording, and Input Monitoring; `settings permission grant` opens the pane. `doctor` has no macOS permission check |
| Build                        | None                                                                     | Explicit `build-driver`; stable signing identity recommended so grants survive rebuilds. **[New]** The MCP path also needs the helper cached and verified, because the adapter never builds anything.                                                                      | Helper built on first use and cached; XCTest needs full Xcode and the runner                                                              |
| Hardware and OS              | Any                                                                      | macOS 14+, Apple silicon                                                                                                                                                                                                                                                   | macOS 13+ for the helper                                                                                                                  |
| Repository policy            | `osascript` and unrestricted capture need separate approval (R-PERM-007) | Covered by the approved Yarn workflows                                                                                                                                                                                                                                     | Would need its own approval and installation                                                                                              |
| App prerequisites            | Running app                                                              | Registered target; for attach, the application lease; Storybook driver running. **[Changed]** For MCP, a supervisor started with `--agent` (`storybook driver --agent` or `desktop-test serve --agent`) publishes the descriptor and, on macOS Storybook, keeps the lease. | Running or installable app; no app changes                                                                                                |
| **[New]** Agent client setup | None                                                                     | Register `desktop-driver-mcp` as a stdio MCP server; with the default descriptor location it needs no arguments                                                                                                                                                            | Register its MCP server or use its CLI                                                                                                    |
| Visible side effects         | Pointer moves                                                            | Pointer moves for physical clicks (AXPress and `perform` avoid it)                                                                                                                                                                                                         | Automation Mode overlay (XCTest) or a 0.3 s ghost cursor (native)                                                                         |

### 3.8 What changes for an agent

- **Compared with no package,** the driver turns guesses into facts. The agent stops inferring state from pixels and
  coordinates, gets explained click failures, and works inside an approved, target-scoped boundary. The cost is setup
  (signing, grants, a running driver) and, at the baseline, a script-writing loop instead of direct commands.
  **[Changed]** Through MCP, the loop is direct tool calls.
- **Compared with agent-device,** the driver was more precise and more portable, but less ergonomic. **[Changed]** The
  ergonomic gap has mostly closed.
  - **Where agent-device still wins:** session recording and replay, shipped skills, logs and React Native tooling,
    and a CLI that works without a supervisor. **[Changed]** Persistent sessions, refs, compact and diff snapshots,
    and MCP now exist in both.
  - **Where the driver wins:** a desktop-first AX design with physical input and occlusion checks rather than Automation
    Mode; typed state with honest `unsupported`; Storybook awareness; a window-event journal; and one API across
    macOS, Windows, and Win32. **[New]** Also settled mutation effects, quarantine, and grant-scoped authority.
  - **Fit for RN desktop:** for FURN's macOS and Windows targets, agent-device is not a substitute. Its macOS backend
    is still being hardened, and it has no Windows support.
- **Most of the gap was in the interface layer, not the native helper.** Helper operations are fast and the data is
  richer. **[Changed]** The branch adds that agent-shaped front end (§5.1). The remaining gaps are lifecycle (`stop`
  and orphan cleanup), turning sessions into tests, and agent guidance.

## 4. Automated testing

### 4.1 Comparison

| Aspect                            | Ad hoc scripts (no package) | desktop-test with storybook-desktop                                                                                                                                                                                                      | agent-device replay                                              | Appium mac2 (previous FURN approach)               |
| --------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| Protocol and authoring            | `osascript` or custom code  | W3C WebDriver with WebdriverIO 10 and Jasmine; CSF3 `wdio` callbacks in stories                                                                                                                                                          | `.ad` line DSL, recorded or hand-written; subset of Maestro YAML | W3C WebDriver through the Appium server and XCTest |
| Platforms with one test           | macOS only                  | macOS, Windows, Win32                                                                                                                                                                                                                    | iOS, Android, TV, web, macOS, Linux; not Windows                 | macOS only (different drivers per platform)        |
| Element model                     | Coordinates or AX scripts   | testID, role, name, text; typed properties; feature flags                                                                                                                                                                                | Selectors and refs; id demotes to role+label on reused testIDs   | XCUIElement types and predicates                   |
| Input fidelity                    | Any                         | Physical with occlusion check, AXPress, or `auto`; full W3C actions. **[Unchanged]** WDIO cannot invoke named accessibility actions                                                                                                      | XCTest or AX; drag needs XCTest                                  | XCTest synthesized events in Automation Mode       |
| Isolation                         | None                        | A fresh worker, session, and remounted story per case                                                                                                                                                                                    | One session per device; replay resumes from a step               | Per-session                                        |
| Results                           | Exit codes                  | JUnit, `run.json`, `events.jsonl`; separate statuses for infrastructure errors, flakes, and empty runs. **[New]** `--reporter auto\|plain\|github-actions\|json\|ndjson` on the desktop-driver, desktop-test, and storybook-desktop CLIs | JUnit; `REPLAY_DIVERGENCE` with suggestions and resume           | Runner-dependent                                   |
| Failure evidence                  | Manual                      | Window events, then screenshot, source, tree, and other windows                                                                                                                                                                          | Snapshot, screenshot, logs in `--artifacts-dir`                  | Screenshot and page source                         |
| Lifecycle                         | Manual                      | Bundle, prep, build, launch, and owned cleanup                                                                                                                                                                                           | `open`, `close`, device claims                                   | Appium server and app path                         |
| CI on macOS                       | Fragile prompts             | Self-hosted or hosted runner with grants; physical clicks can be disabled by policy                                                                                                                                                      | Documented for mobile (EAS); macOS CI not documented             | Needs `automationmodetool` and Xcode helper grants |
| Turn an agent session into a test | No                          | No (suggestion §5.1). **[Unchanged]** The operation journal records agent actions; export is follow-on work                                                                                                                              | Yes, `session save-script`, then `.ad` or Maestro export         | No                                                 |
| Visual comparison                 | Manual                      | No                                                                                                                                                                                                                                       | `diff screenshot --baseline`                                     | Via plugins                                        |

### 4.2 Observed results

- **Legacy FluentTester E2E** moved from Appium to `desktop-test`: macOS Fabric 62/62 locally and on hosted CI, Win32
  201/201, and Windows Fabric 39/39, with no skips or retries. The hosted workflow finished in under 23 minutes.
- **Storybook smoke** on macOS Fabric passed 280/280, including 81 callbacks.
- **Across local Storybook runs:** 1,118 passed, 24 failed, and 40 skipped attempts. Passing attempts have a median of
  52 ms. Failures carry tree, source, screenshot, and window-event evidence.
- **Hosted macOS** runs with physical clicks disabled by target policy (`FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES`).
  `auto` click falls back to AXPress, and keyboard navigation covers controls that do not publish AXPress.
- **[New] Branch pull request checks (Observed).** On the first hosted run of draft PR #4434, the macOS, macOS
  Storybook (Fabric and Paper), Windows, Win32, Win32 Storybook, iOS, Android, and JS lanes passed. The Windows
  Storybook lane failed in its Windows native-contract step: three new Win32 fixture tests
  (`win32Fixture.contract.test.ts` and `operations.contract.test.ts`) need physical click and window capture, but the
  hosted runner disables `keyboard,physicalClick,wheel` and could not create a capture item (`0x80070057`). A
  follow-up commit gates those scenarios on the host policy, so hosted runs report them as explicit skips and
  interactive runs still execute them.
- **[New] Branch live qualification (Observed).** The M3 real-app observation checks and the `desktop_story` MCP path
  passed on macOS Fabric Storybook on the macOS machine and on Windows Fabric and Win32 Paper on the Windows machine. The legacy E2E
  suite and the full local Storybook smoke were not rerun for this update.

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
- **[New] Machine-readable output.** Shared `--reporter` modes give agents and CI minified JSON, NDJSON progress, or
  GitHub Actions annotations from the same commands.

### 4.4 Gaps

- All-skipped WebdriverIO runs are not yet rejected as coverage (#4342). **[Unchanged]**
- No visual comparison; screenshots are evidence only.
- Physical input is global to the desktop, so runs on one machine are serialized.
- The interactive lock has no stale-owner recovery. **[Unchanged]**
- macOS is Apple silicon only and has no notarized helper, so each CI image or developer machine needs a stable signing
  identity and Accessibility and Screen Recording grants for the right responsible process.
- **[Changed]** `helpText` and `required` are still unsupported through WDIO on macOS, and WDIO still cannot invoke
  custom accessibility actions. Bounded observation now reports both facts, and the `perform` operation invokes
  actions.
- The reliability window for required CI (100 runs over 14 days at 99%) is not yet established (#4349).
  **[Unchanged]**
- **[New]** Hosted Windows runs skip the Win32 fixture's physical-input and window-capture scenarios (§4.2); only an
  interactive runner qualifies them.

## 5. Suggestions

Ordered by expected value. "All" means a change in the Node layer or protocol that benefits macOS, Windows, and Win32.

**[New]** Each suggestion keeps its baseline wording and ends with its status on the branch: **Done**, **Done
differently**, **Partly done**, or **Open**. Open items name the plan milestone that owns them, where one does.

### 5.1 Agent workflows (all platforms)

1. **Attach-capable agent entry points.** Add `--launch-mode attach|launch` to the agent CLI and `connectDesktopAgent`.
   When the target allows only attach, default to it. Resolve the application lease automatically, or explain how to
   create it. This fixes §3.6 and is a small change.

   **Status: Partly done.** The MCP adapter attaches by default and, on macOS, `storybook driver --agent` keeps the
   lease current. `connectDesktopAgent` already accepted `launchMode` (§3.6). The CLI still has no flag (M5).

2. **A persistent agent session.** Add `desktop-driver agent session start|stop` (or a small daemon) that keeps one
   WebDriver session. Then add CLI verbs: `find`, `click`, `type`, `press`, `check`, `wait`, `select-story`, `describe`,
   and `screenshot`. This removes per-call session setup and the need to write scripts. It counts as a new agent
   operation, so per `references/security.md` it needs a security review; keep it to registered targets and loopback.

   **Status: Done differently.** The supervisor's grant-scoped service holds the session and the MCP adapter keeps it
   open, with no CLI daemon. Operations cover `observe`, `find`, `act` (`click`, `activate`, `perform`, `type`,
   `clear`), `check` with waits, `sequence`, `capture`, and story selection. `references/security.md` covers the new
   authority. There is no separate key-press action.

3. **An MCP server for the same verbs.** Ideally, add these as tools on the Storybook channel server's existing `/mcp`
   so one endpoint covers story selection, docs, inspection, and input. Strip credentials and paths from tool schemas,
   following agent-device.

   **Status: Done differently.** `desktop-driver-mcp` is a separate stdio adapter with six tools that reaches the
   service through a private descriptor; tool schemas carry no credentials. Storybook's `/mcp` returns 404 under
   `--agent`.

4. **A compact text tree with refs.** One line per node: `@e7 button "Save" #save-button [focused,enabled]`. Add an
   interactive-only filter, omit rects unless asked, drop the story-root metadata name, and return `--json` only on
   request. Measured target: about 0.7k tokens for the full app and tens of tokens for a story, against 9.4k to 14k
   today. Refs should resolve to the session's element UUIDs and fail on stale generations.

   **Status: Done.** `observe` returns an outline by default with session refs, an interactive view, and JSON on
   request. Measured: 1.6k–1.9k tokens for the whole window, 1.1k–1.3k for the default view, and 0.25k–0.3k for a story
   (§3.3), above this item's synthetic targets. The story root still carries its metadata name.

5. **Diffs and tails.** Add `describe --diff` against the previous snapshot. Add `window-events --since <cursor>` or
   `--tail N` so agents read only what changed after an action. The journal already records age and duration.

   **Status: Partly done.** `observe` `delta` returns about 150 tokens when nothing changed, and the `journal` operation
   pages operation records by cursor. `window-events` still has no tail.

6. **Shorter catalog output.** Add `stories list --format ids` (about 2k tokens instead of 19.5k), plus filters by title
   or tag and a flag to show only stories with tests.

   **Status: Partly done.** The `stories` operation pages the catalog (25 of 209 stories in 637 tokens) and filters by
   id, title, or name. There is no ids-only format, tag filter, or has-tests flag.

7. **Record to `wdio` callbacks.** Journal agent-session actions and selectors, then emit a CSF3 `wdio` callback or a
   WDIO spec. This turns an exploratory diagnosis into a portable regression test, the desktop equivalent of
   agent-device's `.ad` save-script.

   **Status: Open.** The operation journal records agent actions; recording, replay, and WDIO export are follow-on work
   (plan §10).

8. **Agent skill and instructions.** Ship a short `SKILL.md` and an `agent-map.yaml` section for the agent verbs:
   observe, act, verify, and stop. Include the 2,000-character limit some MCP clients impose on instructions.

   **Status: Partly done.** The MCP server ships tool descriptions and about 120 tokens of instructions. There is no
   `SKILL.md` and no `agent-map.yaml` section.

9. **Screenshot ergonomics.** Add `--scale points` (1×) to roughly halve image tokens. Add an option to overlay refs or
   testIDs on the image so vision and AX share identities. Add element-cropped captures by ref.

   **Status: Partly done.** `capture` crops by ref, returns metadata and a resource link by default, and inlines pixels
   only on request. There is no point scaling or overlay.

10. **Logs alongside UI.** Optionally tail Metro and the app's console and native logs into the session, filtered to the
    time of an action. Many diagnoses are "the click worked but JS threw."

    **Status: Open** (plan §10).

### 5.2 Testing and harness (all platforms)

1. **Lifecycle hygiene.** Add a `yarn storybook stop --<platform>` that ends owned processes (`rnx-cli`,
   `server-runner`, app, helper). Add stale-owner liveness checks to the interactive lock, using PID plus start time
   like the lease. Add a `doctor` check that reports orphans. This was the most repeated agent friction.

   **Status: Open** (plan M2). SIGINT stops owned processes and releases the lock; a killed supervisor still orphans
   them.

2. **Finish honest status reporting.** Reject all-skipped WDIO runs (#4342) and report skip reasons by feature.

   **Status: Partly done.** Shared `--reporter` modes are new; #4342 is still open.

3. **Invoke accessibility actions.** Add `furn/element/{id}/action/{name}` with input-lock, abort, and stale-element
   handling, and a UIA equivalent (Toggle, ExpandCollapse, Invoke patterns). This removes keyboard workarounds for
   controls without AXPress.

   **Status: Done differently.** The `act` operation's `perform` action invokes a named action under the input lock and
   deadline, and refuses one that changed. macOS uses AX actions and Windows uses UIA patterns; both advertise
   `performAccessibilityAction`. There is no WDIO route.

4. **Optional visual baselines.** Add element-scoped, tolerance-based comparisons that are opt-in per story, with
   provenance (DPI, theme, renderer) as #4348 qualifies capture.

   **Status: Open.**

5. **Flake tooling.** Add a `--repeat N` mode with per-test pass rates, feeding the 99% reliability window (#4349).

   **Status: Open.**

6. **Faster renderer switching.** Use separate DerivedData per renderer so Fabric and Paper builds can coexist and a
   Paper check skips the rebuild back to Fabric.

   **Status: Open;** not re-checked.

7. **Keep wire-level features advertised.** Continue gating every new capability through `furn:features` so shared tests
   branch on capability, not platform.

   **Status: Followed.** `boundedObservation` and `performAccessibilityAction` are advertised features.

### 5.3 macOS-specific

1. **Signed, notarized helper builds** (#4345), so CI images and developers keep privacy grants across updates without
   managing a local signing identity.

   **Status: Open.**

2. **Intel (x86_64) support**, or a documented decision not to support it; the helper is arm64 only today.

   **Status: Open.**

3. **`helpText` and `required`.** Map `AXHelp` and the RN accessibility hint, and expose `required` where the RN macOS
   fork publishes it, instead of returning `unsupported operation`.

   **Status: Partly done.** Bounded observation reports `AXHelp` and `AXRequired`; the WDIO properties still return
   `unsupported operation`.

4. **Alerts, sheets, and menus.** Expose sheets, popovers, the menu bar, and system dialogs (such as permission prompts)
   as selectable windows, with clear ownership rules.

   **Status: Open;** not re-checked.

5. **Accessibility notification waits.** Add `wait for event` on the AXObserver stream (for example focus change or
   value change) instead of polling `find` every 25 ms.

   **Status: Done for `check`.** Waits re-evaluate on the provider's change events and otherwise poll with a backoff
   from 100 ms to 1 s. WDIO waits are unchanged.

6. **Fast Refresh resilience.** Detect the theme-host reload that breaks story selection and report it as an
   infrastructure error, or re-handshake readiness automatically.

   **Status: Open;** not re-checked. The related runtime-bridge reconnect is in plan M5.

7. **Better permission diagnostics.** Name the responsible process that needs the grant (Terminal, VS Code, or the agent
   host), and detect grants lost after an ad hoc rebuild.

   **Status: Open.**

### 5.4 What not to copy from agent-device

**[Unchanged]** The branch follows all three.

- XCTest Automation Mode as a default. Its overlay and shared pointer conflict with the driver's physical-input model
  and hosted CI.
- Private SkyLight event APIs. ADR 0031 uses them for some native-backend drags and WKWebView clicks, and they can
  break in any macOS release.
- Cross-application `desktop` and `menubar` surfaces without the target registration and ownership model.

## 6. Sources

**This repository, baseline (revision `c84acb741`):**

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

**[New] This repository, branch (revision `41fc7473f`, draft PR #4434):**

- `packages/agentic/desktop-driver`: `references/{operations,remaining-work,security,service,protocol}.md`,
  `src/operations/*.ts`, `src/client/DesktopDriverClient.ts`, `src/cli/createDesktopDriverCommand.ts`,
  `src/cli/reporter.ts`, `native/macos/Sources/DesktopDriverHost/{AccessibilityObservation,Observation}.swift`,
  `native/windows/src/driver.cpp`.
- `packages/agentic/desktop-driver-mcp`: `references/{tools,connection}.md`, `src/server.ts`, `src/connection.ts`.
- `packages/agentic/desktop-test/src/agentConnection.ts` and
  `packages/agentic/storybook-desktop/src/cli/DesktopStorybookCli.ts` (`--agent` supervisors).
- Live measurement on 2026-11-04: MCP SDK client over stdio against `yarn storybook driver --macos --agent`
  (button, checkbox, and menu stories; `o200k_base`).
- Pull request checks for PR #4434 (first hosted run).

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
