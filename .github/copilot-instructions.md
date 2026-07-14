# Copilot instructions for FluentUI React Native

## Build, test, and lint commands

- Install dependencies: `yarn`
- Build all workspaces: `yarn build` (runs Lage task `build-all`)
- Lint all workspaces: `yarn lage run lint lint-package`
- Test all workspaces: `yarn lage run test`
- CI-equivalent graph: `yarn lage run buildci`
- Format check/fix: `yarn format:check` / `yarn format`

### Run tests for one package or one test

- Most packages expose `test: "fluentui-scripts jest"`.
- Run tests for a single package:
  - `yarn workspace @fluentui-react-native/button test`
- Run one Jest file (or narrow with `-t`):
  - `yarn workspace @fluentui-react-native/button test -- src/Button.test.tsx -t "renders"`
- Run one E2E spec (from repo root, with WDIO args forwarded):
  - `yarn workspace @fluentui-react-native/e2e-testing e2etest:ios -- --spec src/Button/ButtonSpec.ios.ts`

## High-level architecture

- This repo is a Yarn 4 monorepo (`workspaces`: `apps/*`, `packages/**`, `scripts`) orchestrated by **Lage** (`lage.config.mjs`).
- `packages/` contains the library surface:
  - `components/` and `experimental/` for control implementations
  - `framework/` + `framework-base/` for composition primitives, slots, tokens, theming glue
  - `theming/` for platform theme packages (`android-theme`, `apple-theme`, `win32-theme`, `default-theme`)
  - `deprecated/` still exists but is not the preferred direction for new work
- `apps/fluent-tester` is the primary manual validation app for components.
- `apps/E2E` contains Appium/WebdriverIO end-to-end tests and platform-specific WDIO configs.
- `scripts/` provides the shared `fluentui-scripts` CLI used by package-level `build`, `lint`, and `test`.

## Key conventions for this codebase

- Prefer the current composition model (`@fluentui-react-native/composition`) and avoid introducing new work in deprecated foundation packages.
- Component design is slot/token driven:
  - slots model render-tree parts (`root`, `icon`, `content`, etc.)
  - tokens model theme/customization values and may overlap with props
- Use platform-specific source files where needed (`*.ios.ts`, `*.android.ts`, `*.macos.ts`, `*.win32.ts`).
- In `.tsx` component files, use the custom JSX runtime pragma:
  - `/** @jsxImportSource @fluentui-react-native/framework-base */`
- For package scripts, follow the existing pattern (`fluentui-scripts build|lint|jest`) rather than ad-hoc tooling.
- New components/test pages are expected to add Fluent Tester coverage and corresponding E2E coverage in `apps/E2E`.

## MCP configuration

- The workspace MCP configuration is checked in at `.vscode/mcp.json`.
- Use the GitHub MCP server configured there (`https://api.githubcopilot.com/mcp`) for GitHub-aware tooling in chat/agent workflows.

