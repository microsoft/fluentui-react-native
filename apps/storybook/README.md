# Fluent React Native Storybook

This workspace runs the Fluent React Native component catalog on macOS,
Windows, and Win32. The app owns component-package discovery, app identity,
platform exclusions, and native project configuration. Shared desktop test and
Storybook behavior lives in the package references linked below.

## Start and run

Install dependencies and build from the repository root:

```sh
yarn
yarn build
```

Run the workspace's declared Storybook commands:

```sh
yarn storybook manifest --macos
yarn storybook bundle --macos
yarn storybook smoke --macos --mode stories-and-tests
```

Replace `macos` with `windows` or `win32`. Use `yarn storybook test
--<platform> --list` to discover executable story-test names. Runtime IDs and
listener ports are available through the app's `desktop-driver` command.
See `agent-map.yaml` for the current command contract and paths.

## Platform notes

- macOS defaults to Fabric; `--paper` selects Paper. Run bundle before prep
  when CocoaPods must embed the bundle. Regenerate Pods/project with prep when
  switching renderer.
- Windows uses the generated RN Test App project.
- Win32 uses the prebuilt REX Paper host. Bundle before run; building a native
  host is unsupported.
- Windows Accordion and Win32 Accordion/ListItem are currently excluded from
  the catalog because of native host failures. Use generated manifests rather
  than relying on story counts from older runs.

Generated projects, Pods, manifests, reports, and build products are disposable.
Change the owning config or source instead of generated output.

## Win32 input coverage

Win32/Paper PR testing has independent accessibility and physical-input jobs.
Both traverse the full platform story catalog. Each named test declares
`inputModes: { win32: 'accessibility' | 'physical' | 'both' }` beside its
`run` callback; `both` tests execute in each job. A semantic assertion that first
navigates with the keyboard still belongs to the physical lane.

`yarn input-coverage generate` discovers these declarations and writes
`artifacts/win32/input-tests.win32.json`. This is generated output, not a second
test inventory to maintain. The app owns only the exact exception registry,
[`input-test-quarantines.win32.json`](input-test-quarantines.win32.json).

The accessibility lane masks keyboard, physical clicks, and wheel input and
explicitly uses accessibility clicks. The physical lane enables those features
and explicitly uses physical clicks. Windows/Fabric and macOS policies are
unchanged. Source assertions and capability checks remain authoritative; this
catalog does not convert unsupported actions into passes.

Before smoke, `yarn input-coverage begin` generates the complete statically
discovered Win32 callback catalog and captures the source, lane, and preexisting
report directories. Missing or invalid classifications fail; additions, removals,
and renames come directly from story source. After smoke,
`yarn input-coverage verify` requires one fresh successful canonical test report,
with Win32/Paper provenance, and
one clean passing attempt for every callback assigned to that lane. Unexpected
skips, unsupported results, missing callbacks, duplicates, retries, and flaky
passes fail the job. The existing Button #4373 quarantine remains selected;
only its exact documented skip is permitted and reported as **unvalidated**,
not passed.

From this workspace, inspect a lane without executing native input:

```powershell
$env:STORYBOOK_INPUT_MODE = 'accessibility' # Or 'physical'.
yarn storybook test --win32 --list
Remove-Item Env:\STORYBOOK_INPUT_MODE
```

Actual input execution requires the matching driver capability policy and an
authorized desktop; selecting a lane alone does not grant input authority.
Each CI lane uploads its own `Storybook_win32_paper_<mode>_<run>_<attempt>`
artifact, including canonical native results, the classified input catalog,
and a coverage summary. The required `PR` aggregate includes both matrix jobs.
Run `yarn test` here for catalog and report-gate regression tests.

## Package guidance

- Storybook integration, CLI, discovery, and callbacks:
  `packages/agentic/storybook-desktop/references/README.md`
- App/suite configuration, lifecycle, WDIO, and reports:
  `packages/agentic/desktop-test/references/README.md`
- Native helper, service, and WebDriver:
  `packages/agentic/desktop-driver/references/README.md`
- On-device bridge, Metro, theme, and chrome:
  `packages/agentic/storybook-desktop-runtime/references/README.md`
