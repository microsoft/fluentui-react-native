# Agentic Components Storybook development

These instructions apply to `apps/storybook` and its descendants.

Read this file, `README.md`, and `package.json` before changing the Storybook application or its native projects.

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
  route through `rnx-cli`. The declared platform scripts route through the shared `storybook-desktop` CLI.

## macOS native workflow

- Run `pods:macos` for normal project generation and pod installation. Do not run `pod install --project-directory=...`
  from the repository root: CocoaPods keeps that working directory for React Native CLI autolinking under the pnpm
  linker.
- Run `pods:macos:update` when generated Pods came from an older React Native macOS patch release and CocoaPods reports a
  changed local podspec.
- Run `bundle:macos` to verify the JavaScript bundle, `macos:build` for a non-launching native build, and
  `macos:build:clean` after changing pods, native workarounds, Xcode settings, or React Native versions.
- Use `smoke:macos` for the reusable channel-server, Metro, launch, all-story traversal, and app shutdown lifecycle.
- Preserve the shared smoke instance context: its canonical-root hash coordinates the macOS bundle identifier,
  Storybook port, Metro port, generated runtime polyfill, and exact app shutdown. Do not replace those values with
  process-name matching or fixed smoke ports.
- Only `macos/Podfile` is hand-authored. The workspace, Pods, Podfile.lock, build directory, and DerivedData are generated
  and ignored; `.cache/storybook-desktop` and `macos/.storybook-desktop` are generated instance state. Never patch or
  commit these outputs.
- Diagnose the first actionable CocoaPods or compiler error before editing configuration. If autolinking claims a listed
  dependency is missing, verify resolution from this app directory before adding another dependency.
- Avoid patching generated pod source. If a temporary source patch is unavoidable, document its exact version boundary.
  When removing it, reinstall the affected pod and perform a clean build so stale generated source cannot mask the result.

## Windows native workflow

- Run `windows:info` before investigating a machine-specific toolchain failure.
- Use `windows:generate` to regenerate the Fabric solution, `windows` for the ordinary development build,
  `windows:build` for a non-deploying native build, and `windows:offline` for the bundled Release workflow.
- Use `windows:agent` for the complete agent workflow: start the channel server and Metro, build and launch the app,
  and validate the smoke stories through stable UI Automation selectors. Use `windows:agent:stop` to stop only the
  process IDs recorded by that session.
- Use `smoke:windows` for full indexed-story traversal with the same owned-session cleanup.
- WinAppDriver screenshots are not a reliable capture path for WinAppSDK Composition content. After selecting a story
  with `storybook:control`, use the agent host's desktop screenshot tool when visual evidence is required.
- Build logs, automation evidence, visual trees, screenshots, and session manifests belong under ignored
  `artifacts/windows`.
- Stable native automation selectors use explicit `testID` props. Do not select by visible text, layout order, or
  generated native class name.
- The Storybook REST control helper is `storybook:control`; `storybook:smoke` selects every indexed story and waits for
  its rendered event.
- Keep generated solutions, packages, registrations, and build outputs uncommitted.

## Win32 native workflow

- Win32 is the `@office-iss/react-native-win32` Paper endpoint hosted by
  `@office-iss/rex-win32`; do not treat it as the React Native Windows Fabric
  endpoint or generate a `react-native-test-app` project for it.
- Run `bundle:win32` before `win32`. The bundle is the native dependency source
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
  `../../packages/agentic/storybook-desktop/src/StorybookUI.win32.tsx` because
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
- Generate Win32 stories with `prebuild:win32`. It intentionally excludes the
  ListItem and Accordion stories because their Paper implementations fail-fast
  crash REX 0.81.1. Callout stories and the Callout-backed portal chrome remain
  included; keep the ordinary `prebuild` catalog unchanged for macOS and
  Windows.
- Keep the Win32 window title distinct from the Windows Fabric title so
  automation never attaches to the wrong endpoint.
- Use `win32:ci` for the complete bundle/launch/smoke workflow. Its logs belong
  under ignored `artifacts/win32`, and it must stop only the process IDs it
  started or resolved by its exact port and window title.
- `smoke:win32` exposes `win32:ci` through the shared CLI. Keep `build --win32` unsupported because the endpoint uses
  a prebuilt host rather than an app-owned native project.

## Validation

Run the smallest command that reproduces the issue first. For native or dependency changes, finish with the relevant
bundle and native build, Storybook format/lint, and the root `yarn build` when manifests changed. Review generated output
only to diagnose problems; validate persistence from the hand-authored files and declared scripts.
