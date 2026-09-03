# Agentic Components Storybook development

These instructions apply to `apps/storybook` and its descendants.

Read [`agent-map.yaml`](agent-map.yaml) first for the compact architecture, lookup, and interaction map. Read this file,
`README.md`, `package.json`, and `storybook.config.mts` before changing the Storybook application or its native projects.

## Agent-efficient discovery and interaction

- Generate the platform manifest with `yarn storybook manifest --<platform>` instead of guessing IDs or searching the
  sidebar.
- Query and run stories through `yarn desktop-driver` against the listener started by
  `yarn storybook driver --<platform>`.
- Use screenshots only for visual evidence. Use WebSocket events and accessibility bounds for lookup and interaction.
- Treat `src/storybook.requires.ts` as generated output; use `storybook.config.mts` for story package discovery and
  `src/main.ts` only as the shared config adapter.
- Keep `agent-map.yaml` synchronized when stable paths, scripts, services, or interaction contracts change. Do not list
  individual stories there; the runtime index is authoritative.

## Command and dependency discipline

- From the repository root, invoke scripts with
  `yarn workspace @fluentui-react-native/agentic-components-storybook <script>`. From this directory, use
  `yarn <script>`.
- Use declared scripts rather than invoking Metro, CocoaPods, Xcode, Jest, or TypeScript through guessed commands.
- Run `yarn` from the repository root only after dependency manifests change or when a declared command fails because a
  dependency is missing.
- Preserve unrelated manifest and lockfile edits already present in the worktree.
- Keep only native command exceptions and ownership-specific smoke settings in `storybook.config.mts`. Standard macOS
  and Windows prep, bundle, build, and run commands come from the shared config, derive identity from `app.json`, and
  route through `rnx-cli`. Use `yarn storybook <command> --<platform>`; do not add platform aliases or app-local
  lifecycle scripts.
- `app.json` owns the custom `storybook.testIDPrefix`. Do not create another
  app identity file or duplicate the prefix in runtime source.

## Desktop Driver workflow

- Use `yarn storybook manifest --<platform>` to validate static story-plan
  extraction.
- Use `yarn storybook build-driver --<platform>` for an isolated native helper
  build. `prep` ensures the same verified helper before app preparation.
- Use `yarn storybook driver --<platform>` to start Metro, the Storybook
  channel/MCP listener, and the WebDriver listener under one owned supervisor.
- Use the app's `yarn desktop-driver` script for JSON story-run and agent
  commands against that listener.
- macOS, Windows, and Win32 use their source-built native helpers. Keep the
  deterministic fake provider limited to package contract tests.
- Authored tests belong in component story `parameters.desktopDriver`, not in
  this app. The app owns identity, package discovery, platform exclusions, and
  generated manifests.
- Keep `storybook-desktop.generated`, reports, trees, screenshots, and run
  manifests ignored. Never patch generated runtime identity or story manifests.
- Treat the exact-platform and portable-plan digests as contracts. A dynamic or
  invalid plan must fail generation rather than disappear from the manifest.
- Preserve nonce-authenticated runtime hello/readiness/error messages and
  native story-root verification; do not fall back to uncorrelated channel
  events.

## macOS native workflow

- Run `yarn storybook prep --macos` for project generation and Pod installation. Do not run CocoaPods from the
  repository root because subprocess dependency resolution must start in this workspace.
- Run `yarn storybook bundle --macos` for the JavaScript bundle, `yarn storybook build --macos` for a non-launching
  native build, and `yarn storybook smoke --macos` for the complete owned lifecycle.
- Preserve the shared smoke instance context: its canonical-root hash coordinates the macOS bundle identifier,
  Storybook port, Metro port, generated runtime polyfill, and exact app shutdown. Do not replace those values with
  process-name matching or fixed smoke ports.
- Only `macos/Podfile` is hand-authored. The workspace, Pods, Podfile.lock, build directory, and DerivedData are generated
  and ignored; `storybook-desktop.generated` and `macos/.storybook-desktop` are generated instance state. Never patch or
  commit these outputs.
- Diagnose the first actionable CocoaPods or compiler error before editing configuration. If autolinking claims a listed
  dependency is missing, verify resolution from this app directory before adding another dependency.
- Avoid patching generated pod source. If a temporary source patch is unavoidable, document its exact version boundary.
  When removing it, reinstall the affected pod and perform a clean build so stale generated source cannot mask the result.

## Windows native workflow

- In CI, configure a job-local `FURN_DESKTOP_DRIVER_CACHE_ROOT`, run the shared
  Windows native contract, build and diagnose the helper explicitly, then set
  `FURN_DESKTOP_DRIVER_BUILD_POLICY=never` before `prep` or `smoke`.
- Use `yarn storybook prep --windows`, `bundle --windows`, `build --windows`, and `run --windows` for individual
  stages. Use `yarn storybook smoke --windows --mode stories` for the package-owned generation, channel server, native
  build and registration, Metro launch, full indexed-story traversal, and ownership-safe cleanup. Use
  `--mode stories-and-tests` to run the component-authored desktop-e2e plans after the complete traversal.
- Keep the Windows story-pattern overrides in `storybook.config.mts`; the
  current Accordion and Callout Fabric stories still fail-fast the RNW 0.81
  host during traversal.
- WinAppDriver screenshots are not a reliable capture path for WinAppSDK Composition content. After selecting a story
  through the Storybook control channel, use the agent host's desktop screenshot tool when visual evidence is required.
- Build logs, automation evidence, visual trees, screenshots, and session manifests belong under ignored
  `artifacts/windows`.
- Stable native automation selectors use explicit `testID` props. Do not select by visible text, layout order, or
  generated native class name.
- Keep generated solutions, packages, registrations, and build outputs uncommitted.

## Win32 native workflow

- In CI, build and diagnose `--win32` into a job-local cache and pin
  `FURN_DESKTOP_DRIVER_BUILD_POLICY=never` before smoke. The separate Windows
  Storybook job owns the shared provider's opt-in native contract.
- Win32 is the `@office-iss/react-native-win32` Paper endpoint hosted by
  `@office-iss/rex-win32`; do not treat it as the React Native Windows Fabric
  endpoint or generate a `react-native-test-app` project for it.
- Run `yarn storybook bundle --win32` before `yarn storybook run --win32`. The bundle is the native dependency source
  for the prebuilt REX host.
- Keep package discovery and platform-specific story inclusion in
  `storybook.config.mts`; keep `src/main.ts` as the shared config adapter.
- Keep shared Storybook source platform-neutral. Win32-specific source belongs
  in `.win32.ts` or `.win32.tsx` files, and Metro platform resolution belongs in
  `metro.config.js`.
- REX 0.81.1's V8 cannot parse the Unicode-property regular expressions
  bundled by the current Storybook release. Keep the shared desktop package's compatibility transform
  scoped to Win32; remove it when the REX engine supports Unicode property
  escapes.
- Win32 uses desktop-only chrome in
  `../../packages/agentic/storybook-desktop-runtime/src/StorybookUI.win32.tsx` because
  react-native-win32 omits window dimensions and Storybook's mobile LiteUI
  drawer crashes the Paper host. Keep its default layout conceptually aligned
  with desktop LiteUI: persistent resizable Sidebar, story preview, and
  resizable bottom addon panel. Use `Win32CalloutPortal` only for optional
  pop-outs: native Paper Callout owns the separate window while public
  Storybook exports supply sidebar and addon content. Do not reintroduce
  `@gorhom/portal`, window dimension hooks, or animated mobile drawers. Keep
  the pop-out toolbar contextual: it is mounted only while the inline Sidebar
  is hidden.
- Keep macOS and Windows on upstream LiteUI. Replacing it with the reduced
  Win32 chrome would regress addon controls and responsive behavior while
  increasing local maintenance.
- Keep the Win32 story-pattern override in `storybook.config.mts`. It intentionally excludes ListItem and Accordion
  because their Paper implementations fail-fast crash REX 0.81.1.
- Keep the Win32 window title distinct from the Windows Fabric title so
  automation never attaches to the wrong endpoint.
- Use `yarn storybook smoke --win32 --mode stories` for the package-owned bundle, launch, native desktop-chrome checks,
  full story traversal, and cleanup. Use `--mode stories-and-tests` to run the component-authored desktop-e2e plans
  afterward. Logs belong under ignored `artifacts/win32`. Keep `build --win32` unsupported because the endpoint uses a
  prebuilt host rather than an app-owned native project.

## Validation

Run the smallest command that reproduces the issue first. For native or dependency changes, finish with the relevant
bundle and native build, Storybook format/lint, and the root `yarn build` when manifests changed. Review generated output
only to diagnose problems; validate persistence from the hand-authored files and declared scripts.
