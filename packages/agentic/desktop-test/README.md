# Native desktop test harness

`@fluentui-react-native/desktop-test` owns application-neutral configuration,
native service composition, process lifetimes, and reporting. It depends on
[`desktop-driver`](../desktop-driver/README.md), not Storybook, React, or React
Native. Storybook is an explicitly imported
[integration](../storybook-desktop/README.md); ordinary applications do not
install it.

## Application configuration

Put a `desktop.config.mts` in the application workspace:

```ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    windows: {
      host: {
        kind: 'installed',
        application: {
          executablePath: 'C:\\apps\\Sample.exe',
          windowTitle: 'Sample',
        },
      },
      launchTimeoutMs: 180_000,
      readiness: { kind: 'native', testId: 'application-ready' },
    },
  },
});
```

The source-loadable `/config` entry works before the repository build. `.ts`,
`.mjs`, `.js`, and `.cjs` configs are also supported. Validation is structural,
rejects unknown fields, and does not require a class instance.

Target names default to their endpoint (`macos`, `windows`, or `win32`); custom
names must supply `endpoint`. Renderer is optional for ordinary native apps.
`host.ownership: 'external'` restricts sessions to attach and preserves the app;
the default permits owned launch only. Windows identity requires an exact title
and an executable, AUMID, or verified owner lease, never a title alone.

| Host adapter            | Behavior                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `installed`             | Use the trusted application descriptor; build/prep/bundle/run stages require explicit commands.                                                                            |
| `react-native-test-app` | Derive native commands and identity from `app.json`. Windows verifies the generated renderer and registered package identity.                                              |
| `rex`                   | Win32 prebuilt host with declared `component` and `windowTitle`; use the existing bundle, executable, working directory, and fixed arguments. Native build is unsupported. |

`commands` overrides individual `prep`, `bundle`, `build`, or `run` stages.
Each value is `{ command, args?, cwd?, env? }`, an ordered array of commands, or
`false` to reject the stage. No command string is parsed as an argument list.
Required `services` declare an `id`, command, and optional loopback `readyUrl`.
Service exits are failures even after successful readiness.

The default project root is the config's directory. Application paths,
command working directories, helper paths, and artifacts resolve against their
owning project root. Target references and hook files resolve against their
declaring config's directory; spec globs resolve against the suite's project.

## Standalone WDIO suites

The suite workspace references the application's same-schema target instead
of duplicating its launch settings:

```ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  targets: {
    windows: { use: { config: '../sample/desktop.config.mts', target: 'windows' } },
  },
  suites: {
    regression: {
      kind: 'wdio',
      framework: 'jasmine',
      specs: [['specs/startup.spec.ts', 'specs/controls.spec.ts']],
      hooks: './hooks.ts',
      specFileRetries: 1,
      maxInstances: 1,
    },
  },
});
```

References preserve the app's canonical target identity and paths; overrides
and reference cycles are rejected. Nested spec arrays remain one WDIO worker.
Every glob must match: an empty pattern is an error, not reduced coverage.
Specs can also be an endpoint-keyed map.

Install `@wdio/cli`, `@wdio/local-runner`, and the selected
`@wdio/<framework>-framework` in the suite workspace. The harness does not install
frameworks into applications. Jasmine, Mocha, and Cucumber are accepted framework
names; deterministic integration coverage currently exercises Jasmine.
WDIO owns the session, globals, hooks, TypeScript loader, grouped execution,
retries, and framework assertions. Hooks export a WDIO hook object. The native
command binding uses that existing browser; it never creates a second session.
The generated config uses `.mts` so WDIO enables its TypeScript loader before
loading hooks. Frameworks retain their normal names: an absolute Jasmine
module path causes WDIO to replace Jasmine's assertion API.

Expose `"desktop-test": "desktop-test"` in workspace scripts, then run:

```sh
yarn desktop-test --target windows build-driver
yarn desktop-test --target windows test --suite regression --list
yarn desktop-test --target windows test --suite regression
yarn desktop-test --target windows serve --json
```

`--list` resolves the exact groups without launching anything. `serve` starts
the real native WebDriver service and required services, reports its actual
URL/target, and waits for an owned stop; clients create sessions explicitly.
`--json` keeps stdout machine-readable and diagnostics on stderr.
`prep`, `bundle`, `build`, and `run` expose supported adapter stages.
macOS RN Test App targets accept `--paper`; regenerate with `prep` after changing
renderer. Native tests use verified prebuilt helpers only: run `build-driver`
explicitly first, or provision a compatible helper/cache through
[`nativeDriver` settings](../desktop-driver/references/native-helpers.md).

## Ownership and reporting

One supervisor owns services, workers, the WebDriver listener, and its app
sessions. Nested CLIs and the PowerShell service bridge inherit an authenticated
reporting connection; they do not create competing collectors or consoles.
Required-service failure aborts dependent work. Cleanup drains producers and
stdio, closes sessions, releases input, stops exact owned process trees in
reverse service order, and preserves external apps.

Interactive runs acquire a per-user claim at
`<temporary-directory>/furn-desktop-workload-<user-hash>/interactive.lock`.
Concurrent workloads fail closed. After a crash, inspect the recorded PID/run
and verify that the owner and its resources have stopped before manually
removing that exact stale claim. There is no automatic stale-lock recovery.

Each root run writes `artifacts/desktop/<run-id>/` by default:

| Artifact       | Contents                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| `events.jsonl` | Versioned, source-attributed journal with producer sequence and collector arrival order. |
| `run.json`     | Canonical tests, attempts, selected groups, failures, evidence paths, and final status.  |
| `junit.xml`    | The same outcomes, including infrastructure errors and incomplete work.                  |
| `commands/`    | Bounded, redacted stdout/stderr logs with stream attribution.                            |

Stderr and test progress are live without `--verbose`; verbose also streams
informational output. Failed commands replay contiguous logs. GitHub Actions
adds balanced groups, deduplicated failure annotations, and an optional step
summary; raw child output cannot issue workflow commands. Artifact references
are filesystem paths, not uploaded URLs. Archive the entire run directory with
an `always()` upload step.

Original errors, causes, retry attempts, flaky status, skips, unsupported
capabilities, and unfinished selected groups remain in the result. A zero
worker exit cannot override failed assertions or incomplete work. Empty or
all-skipped required cohorts do not pass; `optional: true` permits a fully
skipped cohort to exit successfully without labeling it passed.

## Qualification

Package contracts and a passing Win32 behavioral pilot are not complete native
qualification. See the [E2E migration boundary](../../../apps/E2E/README.md#native-desktop-migration)
for preserved baseline groups and unsupported semantics. Legacy desktop Appium
lanes remain until equivalent-build semantic parity and the driver's
100-execution/14-day reliability gates pass on each endpoint. Mobile lanes are
outside this migration.

Use the package's `format`, `lint`, `build`, and `test` scripts for deterministic
checks. Matching-OS native builds and real application/input evidence are
separate requirements.
