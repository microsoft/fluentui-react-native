# Agentic Components Storybook development

These instructions apply to `packages/agentic-components/storybook` and its descendants.

Read this file, `README.md`, and `package.json` before changing the Storybook application or its native projects.

## Command and dependency discipline

- From the repository root, invoke scripts with
  `yarn workspace @fluentui-react-native/agentic-components-storybook <script>`. From this directory, use
  `yarn <script>`.
- Use declared scripts rather than invoking Metro, CocoaPods, Xcode, Jest, or TypeScript through guessed commands.
- Run `yarn` from the repository root only after dependency manifests change or when a declared command fails because a
  dependency is missing.
- Preserve unrelated manifest and lockfile edits already present in the worktree.

## macOS native workflow

- Run `pods:macos` for normal project generation and pod installation. Do not run `pod install --project-directory=...`
  from the repository root: CocoaPods keeps that working directory for React Native CLI autolinking under the pnpm
  linker.
- Run `pods:macos:update` when generated Pods came from an older React Native macOS patch release and CocoaPods reports a
  changed local podspec.
- Run `bundle:macos` to verify the JavaScript bundle, `macos:build` for a non-launching native build, and
  `macos:build:clean` after changing pods, native workarounds, Xcode settings, or React Native versions.
- Only `macos/Podfile` is hand-authored. The workspace, Pods, Podfile.lock, build directory, and DerivedData are generated
  and ignored; never patch or commit them.
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
- WinAppDriver screenshots are not a reliable capture path for WinAppSDK Composition content. After selecting a story
  with `storybook:control`, use the agent host's desktop screenshot tool when visual evidence is required.
- Build logs, automation evidence, visual trees, screenshots, and session manifests belong under ignored
  `artifacts/windows`.
- Stable native automation selectors use explicit `testID` props. Do not select by visible text, layout order, or
  generated native class name.
- The Storybook REST control helper is `storybook:control`; `storybook:smoke` selects every indexed story and waits for
  its rendered event.
- Keep generated solutions, packages, registrations, and build outputs uncommitted.

## Validation

Run the smallest command that reproduces the issue first. For native or dependency changes, finish with the relevant
bundle and native build, Storybook format/lint, and the root `yarn build` when manifests changed. Review generated output
only to diagnose problems; validate persistence from the hand-authored files and declared scripts.
