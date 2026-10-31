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

## Package guidance

- Storybook integration, CLI, discovery, and callbacks:
  `packages/agentic/storybook-desktop/references/README.md`
- App/suite configuration, lifecycle, WDIO, and reports:
  `packages/agentic/desktop-test/references/README.md`
- Native helper, service, and WebDriver:
  `packages/agentic/desktop-driver/references/README.md`
- On-device bridge, Metro, theme, and chrome:
  `packages/agentic/storybook-desktop-runtime/references/README.md`
