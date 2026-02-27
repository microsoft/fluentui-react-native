# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

The project uses **Yarn 4** (Berry) in **pnpm mode** with **Lage** as the task runner for orchestrating builds across the monorepo. The pnpm mode provides better disk space efficiency and stricter dependency management.

### Primary Commands

```bash
yarn build      # TypeScript build for all packages (outputs to lib/ and lib-commonjs/)
yarn test       # Build, lint, and run tests across all packages
yarn lint       # ESLint across all packages
yarn bundle     # Bundle all packages
yarn buildci    # Full CI pipeline: build + test + lint + bundle + depcheck + check-publishing
yarn clean      # Clean build artifacts
```

### Development Commands

```bash
yarn format           # Format code with oxfmt
yarn depcheck         # Check for unused dependencies across packages
yarn depcheck-fix     # Fix depcheck issues automatically
yarn align-deps       # Align React Native dependencies using @rnx-kit/align-deps
yarn changeset        # Generate changeset files (required before PR merge)
```

### Lage Configuration

The build pipeline is defined in `lage.config.js`:

- Tasks have dependency ordering (e.g., `test` depends on `build`)
- Lage uses caching to avoid redundant steps
- Add `--no-cache` to bypass caching
- Add `--verbose` for detailed output

### Package-Level Commands

Individual packages use `fluentui-scripts` (in `/scripts/`) which provides:

- `yarn build` - TypeScript compilation to `lib/` (ESM) and `lib-commonjs/` (CJS)
  - The build script automatically sets `--moduleResolution` to match `--module` for TypeScript 5.8+ compatibility
  - ESM builds use `--module esnext --moduleResolution bundler`
  - CJS builds use `--module node16 --moduleResolution node16`
- `yarn lint` - ESLint
- `yarn lint-package` - Lint package configuration (includes align-deps and depcheck)
  - Use `--fix` flag to automatically fix issues
  - Validates dependencies, scripts, entry points, and build configuration
- `yarn test` - Jest tests (where applicable)
- `yarn depcheck` - Check for unused dependencies
- `yarn format` - Check code formatting
- `yarn format:fix` - Fix code formatting

## TypeScript Configuration

The repository uses **TypeScript 5.8+** with **@typescript/native-preview** for improved performance and React Native compatibility. The native preview is automatically added to packages with a `tsconfig.json` via dynamic package extensions.

### Key TypeScript Settings

- Base configuration in `/scripts/configs/tsconfig.json`
- Module system: `node16` with matching `moduleResolution: node16`
- Target: `es2022`
- Strict mode enabled (with some exceptions for legacy code compatibility)
- **TypeScript Native Preview**: Packages automatically receive `@typescript/native-preview` as a development dependency

### TypeScript 5.8+ Compatibility Notes

- The `suppressImplicitAnyIndexErrors` option has been removed (deprecated in TS 5.8+)
- Module resolution must match module format when using Node16 resolution
- Stricter type checking for platform values (e.g., `Platform.OS` doesn't include 'win32' in React Native types, but react-native-windows does support it at runtime)
- TypeScript native preview provides better performance for large React Native codebases

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

**Using Composition Framework**: Use `@fluentui-react-native/composition` for new components. For simpler components without slots/tokens, use the `stagedComponent` pattern from `@fluentui-react-native/use-slot`.

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
4. Create source files in `src/`
5. Add test page to FluentTester at `/apps/fluent-tester/src/TestComponents/<ComponentName>/`
6. Register test page in `testPages.tsx` and platform-specific `testPages.<platform>.tsx`
7. Add E2E tests (see E2E Testing section)
8. Run `yarn` and `yarn build` from root
9. For Apple platforms: run `pod install` in test app directories

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

**Unit Tests**: Component-specific Jest tests where present, typically in `src/` directories.

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

- Run `yarn changeset` to create changeset files when modifying packages
- Changesets are required before merging PRs (validated in CI)
- Changesets config in `.changeset/config.json`
- Major versions are disallowed (validated in CI via `.github/scripts/validate-changesets.mts`)
- Version bump PRs are created automatically by GitHub Actions
- Publishing happens in Azure Pipelines using `changeset publish`

## Important Notes

- This is an **alpha-stage** library under active development
- **Requires TypeScript 5.8+** with `@typescript/native-preview` for proper type checking and module resolution
- **Uses Yarn 4 in pnpm mode** for dependency management (configured in `.yarnrc.yml`)
- **Uses modern automatic JSX runtime** - all components should use `@jsxImportSource @fluentui-react-native/framework-base`
- **Dynamic package extensions**: Common dev dependencies (TypeScript, Jest, ESLint, Prettier) are automatically added via `scripts/dynamic.extensions.mjs`
- **Integrated linting**: `yarn lint-package` now includes align-deps and depcheck validation
- Follow existing component patterns for consistency
- Test components using FluentUI Tester app before submitting PRs
- Platform differences should be documented in component `SPEC.md` files
- Use the newer composition framework (`@fluentui-react-native/composition`) for new components, not the deprecated foundation frameworks
- When importing V1 components, consider aliasing: `import { ButtonV1 as Button }`
- Slot functions return `React.ReactElement` - you can safely access `.props` without type assertions
