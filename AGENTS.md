# AGENTS.md

This file provides guidance to coding agents (Claude Code and others) when working with code in this repository.

## Project Overview

This is the **FluentUI React Native** repository, a monorepo containing React Native components that implement Microsoft's Fluent Design System. The repository supports multiple platforms including iOS, Android, macOS, Windows, and Win32.

## Repository Architecture

### High-Level Structure

```
/apps/           - Demo and test applications
  /fluent-tester/ - Main test app for component development
  /E2E/          - End-to-end testing setup using Appium/WebDriverIO
  /win32/        - Win32-specific test app
  /component-generator/ - Tool to generate new components
/packages/       - Core library packages
  /components/   - UI component implementations (Button, Checkbox, Avatar, etc.)
  /framework/    - Core theming and composition framework
    /composition/ - Component composition factory (current approach)
    /theme/      - Theme system
    /use-tokens/ - Token-based styling hooks
    /use-slots/  - Slot-based component composition
  /theming/      - Theme definitions for different platforms
    /android-theme/
    /apple-theme/
    /default-theme/
    /win32-theme/
  /experimental/ - Components under active development
  /deprecated/   - Old framework code (foundation-compose, foundation-composable)
  /utils/        - Shared utilities and tools
/scripts/        - Build and development scripts (fluentui-scripts CLI)
/docs/           - Component and theming documentation
```

### Key Framework Concepts

**Composition Framework**: The repository uses `@fluentui-react-native/composition` (located at `packages/framework/composition/`) for building components. This is the current approach and is simpler than the older foundation-compose/foundation-composable frameworks in `/deprecated/`.

**Slots**: The slot pattern is used to compose higher-order components. A slot represents an inner component (actual entry in the render tree). For example, a Button might have slots for `root`, `icon`, and `content`. This allows advanced customization scenarios. Components wrapping a single native component typically have one slot.

**Tokens**: Design tokens handle styling and customization. Tokens are design-time values set via theme or component customization (e.g., "brandColor"). Tokens can also be props (specified via "TokensThatAreAlsoProps"). This system enables simpler customization and better memoization.

**Platform-Specific Files**: Components use platform-specific files with extensions like `.ios.ts`, `.android.ts`, `.win32.ts`, `.macos.ts` for platform-specific implementations.

**Legacy vs V1**: Many components have both legacy and V1 implementations (e.g., `Button` and `ButtonV1`). The V1 versions use the newer composition framework and are preferred.

## Build System & Commands

The repository builds as a **single unified TypeScript project-references graph** compiled by **tsgo** (`@typescript/native-preview`). The root `tsconfig.json` lists every package's `tsconfig.json` under `references`, and `yarn build` runs `tsgo -b` over that graph, building each package in dependency order. **Lage** orchestrates the non-build tasks (bundle, test, lint, clean), and **Yarn 4 (Berry)** in **pnpm mode** manages dependencies (configured in `.yarnrc.yml`).

### Primary Commands (from the repo root)

```bash
yarn build         # Unified TypeScript build of all packages (tsgo -b); emits each package's lib/
yarn build --clean # Remove build outputs (tsgo -b --clean); follow with `yarn build` for a full rebuild
yarn lage test     # Build + run tests across packages
yarn lage lint     # Lint across packages
yarn lint-fix      # Lint with autofix (cross-env FURN_FIX_MODE=true lage lint)
yarn bundle:repo   # Bundle all packages (lage bundle)
yarn lage buildci  # CI aggregate graph: lint-repo, check-publishing, build, test, lint
yarn clean         # Clean build artifacts (lage clean)
yarn format        # Format code with oxfmt
yarn format:check  # Check formatting without writing
```

### Repo-Level Checks & Housekeeping

```bash
yarn lint-repo        # Repo-wide structural lint (scripts/src/tasks/lintRepo.ts)
yarn lint-lockfile    # Validate the Yarn lockfile
yarn check-publishing # Validate package publishing configuration
yarn change           # Create a change file for the current branch
yarn change:check     # Verify required change files exist
yarn docs             # Start the documentation site
```

### Lage Configuration

The task pipeline is defined in `lage.config.mjs`:

- Tasks declare dependency ordering (e.g. `test` dependsOn `build`)
- `buildci` is the aggregate CI alias (lint-repo, check-publishing, build, test, lint)
- Lage caches task outputs; add `--no-cache` to bypass caching and `--verbose` for detailed output

### Package-Level Commands

Each package's own `build` script is `tsgo -b` (it builds that package together with its referenced dependencies). Other per-package tasks run through the `fluentui-scripts` CLI (in `/scripts/`):

- `yarn build` - tsgo project-references build (emits to `lib/`)
- `yarn lint` - ESLint (`fluentui-scripts lint`)
- `yarn test` - Jest tests where present (`fluentui-scripts jest`)
- `yarn depcheck` - Unused-dependency check (`fluentui-scripts depcheck`)
- `yarn format` / `yarn format:fix` - Check / fix formatting

`fluentui-scripts` also retains a `build` command that can emit dual ESM (`lib/`) and CommonJS (`lib-commonjs/`) output driven by per-package build config, but packages on this branch build with `tsgo -b` directly.

## TypeScript Configuration

The repo uses **TypeScript 5.8+** via **tsgo** (`@typescript/native-preview`), which is automatically added as a dev dependency to every package that has a `tsconfig.json` through dynamic package extensions (`scripts/dynamic.extensions.mts`).

The whole repo compiles as one **composite project-references graph**: the root `tsconfig.json` lists every package under `references`, `tsgo -b` builds them in dependency order, and each package caches incremental state in `.cache/tsconfig.tsbuildinfo`.

### Key TypeScript Settings

- Base config: `scripts/configs/tsconfig/tsconfig.json` → extends `tsconfig.strict.json` → `@rnx-kit/tsconfig/tsconfig.nodenext.json`
- `target` / `lib`: `esnext`
- `module`: `esnext`, `moduleResolution`: `bundler` (ESM)
- `jsx`: `react-jsx`
- `rewriteRelativeImportExtensions: true` (ESM relative-import extension rewriting)
- `composite: true` (required for project references), `outDir: lib`
- Strict mode, relaxed for legacy compatibility (`strictNullChecks`, `noImplicitAny`, and `strictBindCallApply` are disabled in the base config)

### Compatibility Notes

- `suppressImplicitAnyIndexErrors` was removed in TS 5.8+
- `Platform.OS` doesn't include `'win32'` in the React Native types even though react-native-windows supports it at runtime — use `Platform.OS === ('win32' as any)`
- The platform React Native forks (`react-native`, `react-native-windows`, `react-native-macos`, `@office-iss/react-native-win32`) have overlapping but divergent type definitions. Do **not** import more than one fork into a single program's type graph (it produces order-dependent type confusion under the unified build). Keep fork imports in `.win32.ts` / `.windows.ts` / `.macos.ts` files, or redeclare the needed shapes platform-neutrally.

### Framework Type System

The composition framework uses precise types for better type safety:

- **`SlotFn<TProps>`**: Slot functions return `React.ReactElement | null` (not `ReactNode`)
  - This reflects the actual behavior: slots always return elements via staged render or `React.createElement`
  - Provides better type inference when accessing slot props (e.g., `Slots.root({}).props`)
- **`FinalRender<TProps>`**: Final render functions in staged components return `JSX.Element | null`
  - Used in composition framework's `useRender` functions
  - Ensures type compatibility between staged components and the composition system

## Development Workflow

### Setting Up Development Environment

1. Clone repository
2. Run `yarn` to install dependencies
3. Run `yarn build` to build all packages
4. Launch FluentUI Tester app for component testing (see `/apps/fluent-tester/README.md`)

### Component Development

**Component Location**: Components are in `/packages/components/` (stable) or `/packages/experimental/` (under development).

**Component Structure**: Each component typically has:

- `package.json` - Package definition with workspace dependencies
- `src/index.ts` - Main export file
- `src/<Component>.tsx` - Component implementation (requires `/** @jsxImportSource @fluentui-react-native/framework-base */` pragma)
- `src/<Component>.types.ts` - TypeScript type definitions
- `src/<Component>.styling.ts` - Styling and token definitions
- `src/<Component>.<platform>.ts` - Platform-specific implementations
- `SPEC.md` - Component specification and usage documentation
- `MIGRATION.md` - Migration guide (for V1 components)
- `tsconfig.json`, `babel.config.js`, `jest.config.js`, `eslint.config.js`

**Using Composition Framework**: Use `@fluentui-react-native/composition` for new components. For simpler components without slots/tokens, use the `stagedComponent` pattern from `@fluentui-react-native/framework-base`.

**JSX Runtime**: All components use the modern automatic JSX runtime:

- Add `/** @jsxImportSource @fluentui-react-native/framework-base */` at the top of `.tsx` files
- The custom jsx-runtime intercepts JSX calls to optimize slot rendering
- No need to import `withSlots` - it's handled automatically by the runtime
- Components using React Fragments (`<>...</>`) work automatically (Fragment is re-exported from the jsx-runtime)
- Packages using the jsx-runtime need `@fluentui-react-native/framework-base` in `devDependencies`

**TypeScript Patterns**:

- Slot functions automatically return `React.ReactElement`, so you can access `.props` directly without type assertions
- When checking for win32 platform: `Platform.OS === ('win32' as any)` - TypeScript doesn't recognize 'win32' but react-native-windows supports it
- Final render functions should return `FinalRender<TProps>` with children as rest parameters: `(props: TProps, ...children: React.ReactNode[])`

**Native Modules**: Components with native code (iOS/Android/Windows):

- Typically have one root slot wrapping the native component
- Use `codegenNativeComponent` for new architecture compatibility
- May use `constantsToExport` for default values from native side
- iOS/macOS: Include `.podspec` files
- Must be added to FluentTester's Podfile (transitive dependencies aren't autolinked)

### Creating a New Component

1. Create directory: `/packages/components/<ComponentName>` or `/packages/experimental/<ComponentName>`
2. Copy structure from existing component (e.g., Shimmer, Button)
3. Update `package.json` with correct name and dependencies (use `workspace:*` for internal packages)
4. Add the new package's `tsconfig.json` to the root `tsconfig.json` `references` so it joins the unified build
5. Create source files in `src/`
6. Add test page to FluentTester at `/apps/fluent-tester/src/TestComponents/<ComponentName>/`
7. Register test page in `testPages.tsx` and platform-specific `testPages.<platform>.tsx`
8. Add E2E tests (see E2E Testing section)
9. Run `yarn` and `yarn build` from root
10. For Apple platforms: run `pod install` in test app directories

### Theming

Platform-specific themes are in `/packages/theming/`:

- `android-theme/` - Android theming
- `apple-theme/` - iOS and macOS theming
- `win32-theme/` - Win32 theming
- `default-theme/` - Cross-platform defaults
- `theme-tokens/` - Token definitions
- `theme-types/` - TypeScript types for themes

Components require `ThemeProvider` from `@fluentui-react-native/theme` to work properly.

### Testing

**Manual Testing**: Use FluentUI Tester app (`/apps/fluent-tester/`) for interactive component testing. Test pages are in `/apps/fluent-tester/src/TestComponents/`.

**E2E Testing**: Required for all new components. Uses Appium + WebDriverIO.

- E2E tests live in `/apps/E2E/src/<ComponentName>/`
- Each component needs:
  - Page Object (`<Component>PageObject.<platform>.ts`) - Interface to interact with test page
  - Spec Document (`<Component>Spec.<platform>.ts`) - Jasmine test cases
  - Constants file in test component (`/apps/fluent-tester/src/TestComponents/<Component>/consts.ts`)
- Test pages must include:
  - `testID` on first section matching page object's `_pageName`
  - Optional `e2eSections` prop for dedicated E2E test elements
- Run E2E tests: `yarn e2etest:<platform>` from `/apps/E2E/`

**Unit Tests**: Component-specific Jest tests where present, typically in `src/` directories. Run them with `yarn test` in a package or `yarn lage test` from the root.

### Platform-Specific Development

**iOS/macOS**:

- May wrap native controls from FluentUI Apple
- Requires `.podspec` files for native modules
- Run `pod install` after adding dependencies

**Android**:

- Platform-specific styling and tokens
- Uses `accessibilityLabel` for E2E selectors (other platforms use `testID`)

**Win32**:

- Separate test app at `/apps/win32/`
- Uses WinAppDriver for E2E testing

**Windows (UWP)**:

- Separate test app configuration
- Legacy support

## Version Management

**Changesets**: Used for change logs and versioning.

- Run `yarn change` to create a change file when modifying packages
- Change files are required before merging PRs (validated in CI via `yarn change:check`)
- Changesets config in `.changeset/config.json`
- Major versions are disallowed (validated in CI via `.github/scripts/validate-changesets.mts`)
- Version bump PRs are created automatically by GitHub Actions; `yarn changeset:version` applies version bumps
- Publishing happens in Azure Pipelines using `changeset publish`

## Important Notes

- This is an **alpha-stage** library under active development
- **Requires TypeScript 5.8+** with `@typescript/native-preview` (tsgo); the unified build runs `tsgo -b` over the root project-references graph
- **Uses Yarn 4 in pnpm mode** for dependency management (configured in `.yarnrc.yml`)
- **Uses modern automatic JSX runtime** - all components should use `@jsxImportSource @fluentui-react-native/framework-base`
- **Dynamic package extensions**: Common dev dependencies (TypeScript/tsgo, Jest, ESLint, Prettier) are automatically added via `scripts/dynamic.extensions.mts`
- New packages must be added to the root `tsconfig.json` `references` to join the unified build
- Follow existing component patterns for consistency
- Test components using FluentUI Tester app before submitting PRs
- Platform differences should be documented in component `SPEC.md` files
- Use the newer composition framework (`@fluentui-react-native/composition`) for new components, not the deprecated foundation frameworks
- When importing V1 components, consider aliasing: `import { ButtonV1 as Button }`
- Slot functions return `React.ReactElement` - you can safely access `.props` without type assertions
