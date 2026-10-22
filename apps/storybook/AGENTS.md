# Agentic Components Storybook

These instructions apply to the `apps/storybook` consumer. Shared CLI, app
configuration, driver, and runtime behavior belongs to package-owned guidance:

- `packages/agentic/storybook-desktop/references/README.md`
- `packages/agentic/desktop-test/references/README.md`
- `packages/agentic/desktop-driver/references/README.md`
- `packages/agentic/storybook-desktop-runtime/references/README.md`

## App-owned configuration

- Read `agent-map.yaml` for stable paths, declared scripts, and runtime
  discovery commands. Keep it compact; the runtime story catalog is
  authoritative.
- `desktop.config.mts` owns app name, package discovery, platform story
  exclusions, and native command exceptions. Do not duplicate this
  configuration in runtime source.
- `app.json` owns native identity and `storybook.testIDPrefix`.
- Keep `src/storybook.requires.ts` generated. Change app config and regenerate.
- Use `yarn storybook <command> --<platform>` or the app's `desktop-driver`
  script. Run package scripts rather than guessed Metro, CocoaPods, Xcode,
  Jest, or TypeScript commands.

## Native app workflows

- macOS defaults to Fabric. Use `--paper` only when qualifying Paper and rerun
  `prep` when switching renderer. Bundle before prep if Pods must embed the
  JavaScript bundle. Only `macos/Podfile` is hand-authored; Pods, lockfiles,
  workspaces, build products, and DerivedData are generated.
- Windows project files and registrations are generated. Preserve the app's
  declared helper and identity setup.
- Win32 uses the prebuilt REX Paper host. Bundle before run; native build is
  unsupported. Keep app-owned story exclusions in `desktop.config.mts`.
- The app excludes Windows Accordion and Win32 Accordion/ListItem due to
  current native-host failures. Remove exclusions only after the owning
  component is verified on that endpoint.

## Diagnostics and validation

Use `yarn storybook manifest --<platform>` to validate static extraction,
`yarn storybook instance --<platform>` for actual ports and target identity,
and `yarn storybook --verbose smoke --<platform>` for owned runtime
diagnostics. Use the platform agent map for additional commands. Prefer
target-scoped capture through `desktop-driver`; screenshots do not replace
accessibility lookup.

Use the package references for the native helper, authenticated readiness,
reporting, and smoke contracts. Respect the
[repository permission rules](../../references/agents/repository/permissions.md),
including separate authorization for privacy changes and unrestricted capture.
After dependency or workaround changes, regenerate native dependency sources
and clean-build. Finish code/configuration changes with
`yarn clean-lage-cache` then `yarn lage buildci` (R-VALID-003).
