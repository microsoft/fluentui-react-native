# Agentic Components Storybook development

These instructions apply to `packages/agentic-components/storybook` and its descendants.

Read [`agent-map.yaml`](agent-map.yaml) first for the compact architecture, lookup, and interaction map. Read this file,
`README.md`, and `package.json` before changing the Storybook application or its native projects.

## Agent-efficient discovery and interaction

- Query the live story index with `yarn storybook-agent stories <query>` instead of guessing IDs or searching the
  sidebar.
- Select stories with `yarn storybook-agent select <runtime-story-id>` and sweep renderability with
  `yarn storybook-agent sweep [query]`.
- Use screenshots only for visual evidence. Use WebSocket events and accessibility bounds for lookup and interaction.
- Treat `src/storybook.requires.ts` as generated output; use `src/main.ts` for source configuration.
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

- Use `windows:generate` to regenerate the Fabric solution, `windows` for the development build, and `windows:offline`
  for the bundled Release workflow.
- Keep generated solutions, packages, registrations, and build outputs uncommitted.

## Validation

Run the smallest command that reproduces the issue first. For native or dependency changes, finish with the relevant
bundle and native build, Storybook format/lint, and the root `yarn build` when manifests changed. Review generated output
only to diagnose problems; validate persistence from the hand-authored files and declared scripts.
