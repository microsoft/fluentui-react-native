# fluentui-react-native

Unified mono-package for [FluentUI React Native](https://github.com/microsoft/fluentui-react-native). Import any published package via a single dependency using subpath imports.

## Installation

```bash
yarn add fluentui-react-native
# or
npm install fluentui-react-native
```

## Usage

The package provides **two levels of imports**: individual subpaths for precise access, and category barrels for convenience.

### Individual subpaths (recommended)

Every `@fluentui-react-native/*` package is available as a subpath — just drop the `@`:

```ts
import { Button } from 'fluentui-react-native/button';
import { ThemeProvider } from 'fluentui-react-native/theme';
import { Avatar } from 'fluentui-react-native/avatar';
import { Menu } from 'fluentui-react-native/menu';
```

Each subpath re-exports exactly one package, so there are no name collisions and tree-shaking is optimal.

### Category barrels

For quick prototyping or when importing from many packages in the same category:

```ts
import { Button, Avatar, Menu } from 'fluentui-react-native/components';
import { ThemeProvider } from 'fluentui-react-native/core';
import { appleTheme } from 'fluentui-react-native/theming';
import { Spinner, Tooltip } from 'fluentui-react-native/experimental';
```

Category barrels re-export all packages in a group. If two packages in the same category export the same symbol name, that symbol is excluded from the barrel (per ES module `export *` semantics). In that case, import from the individual subpath instead.

**Available barrels**: `./components`, `./experimental`, `./core`, `./theming`, `./utils`, `./deprecated`

### Migration

Migrating from individual packages is a find-and-replace:

```diff
-import { Button } from '@fluentui-react-native/button';
+import { Button } from 'fluentui-react-native/button';
```

The individual `@fluentui-react-native/*` packages continue to be published and versioned independently — existing consumers are not affected.

## Package Structure

### Category barrels

| Barrel | Contains | Packages |
|--------|----------|----------|
| `./components` | Stable UI components | 25 |
| `./experimental` | Components under active development | 17 |
| `./core` | Framework, composition, slots, tokens | 9 |
| `./theming` | Platform themes and token definitions | 7 |
| `./utils` | Shared utilities | 4 |
| `./deprecated` | Legacy `@uifabricshared/*` packages | 8 |

### Individual subpaths

#### Components (25)

| Subpath | Package |
|---------|---------|
| `./avatar` | `@fluentui-react-native/avatar` |
| `./badge` | `@fluentui-react-native/badge` |
| `./button` | `@fluentui-react-native/button` |
| `./callout` | `@fluentui-react-native/callout` |
| `./checkbox` | `@fluentui-react-native/checkbox` |
| `./chip` | `@fluentui-react-native/chip` |
| `./contextual-menu` | `@fluentui-react-native/contextual-menu` |
| `./divider` | `@fluentui-react-native/divider` |
| `./focus-trap-zone` | `@fluentui-react-native/focus-trap-zone` |
| `./focus-zone` | `@fluentui-react-native/focus-zone` |
| `./icon` | `@fluentui-react-native/icon` |
| `./input` | `@fluentui-react-native/input` |
| `./link` | `@fluentui-react-native/link` |
| `./menu` | `@fluentui-react-native/menu` |
| `./menu-button` | `@fluentui-react-native/menu-button` |
| `./notification` | `@fluentui-react-native/notification` |
| `./persona` | `@fluentui-react-native/persona` |
| `./persona-coin` | `@fluentui-react-native/persona-coin` |
| `./pressable` | `@fluentui-react-native/pressable` |
| `./radio-group` | `@fluentui-react-native/radio-group` |
| `./separator` | `@fluentui-react-native/separator` |
| `./stack` | `@fluentui-react-native/stack` |
| `./switch` | `@fluentui-react-native/switch` |
| `./tablist` | `@fluentui-react-native/tablist` |
| `./text` | `@fluentui-react-native/text` |

#### Experimental (17)

| Subpath | Package |
|---------|---------|
| `./drawer` | `@fluentui-react-native/drawer` |
| `./dropdown` | `@fluentui-react-native/dropdown` |
| `./experimental-activity-indicator` | `@fluentui-react-native/experimental-activity-indicator` |
| `./experimental-appearance-additions` | `@fluentui-react-native/experimental-appearance-additions` |
| `./experimental-avatar` | `@fluentui-react-native/experimental-avatar` |
| `./experimental-checkbox` | `@fluentui-react-native/experimental-checkbox` |
| `./experimental-expander` | `@fluentui-react-native/experimental-expander` |
| `./experimental-menu-button` | `@fluentui-react-native/experimental-menu-button` |
| `./experimental-native-date-picker` | `@fluentui-react-native/experimental-native-date-picker` |
| `./experimental-native-font-metrics` | `@fluentui-react-native/experimental-native-font-metrics` |
| `./experimental-shadow` | `@fluentui-react-native/experimental-shadow` |
| `./experimental-shimmer` | `@fluentui-react-native/experimental-shimmer` |
| `./overflow` | `@fluentui-react-native/overflow` |
| `./popover` | `@fluentui-react-native/popover` |
| `./spinner` | `@fluentui-react-native/spinner` |
| `./tooltip` | `@fluentui-react-native/tooltip` |
| `./vibrancy-view` | `@fluentui-react-native/vibrancy-view` |

#### Core / Framework (9)

| Subpath | Package |
|---------|---------|
| `./composition` | `@fluentui-react-native/composition` |
| `./framework` | `@fluentui-react-native/framework` |
| `./framework-base` | `@fluentui-react-native/framework-base` |
| `./theme` | `@fluentui-react-native/theme` |
| `./themed-stylesheet` | `@fluentui-react-native/themed-stylesheet` |
| `./use-slot` | `@fluentui-react-native/use-slot` |
| `./use-slots` | `@fluentui-react-native/use-slots` |
| `./use-styling` | `@fluentui-react-native/use-styling` |
| `./use-tokens` | `@fluentui-react-native/use-tokens` |

#### Theming (7)

| Subpath | Package |
|---------|---------|
| `./android-theme` | `@fluentui-react-native/android-theme` |
| `./apple-theme` | `@fluentui-react-native/apple-theme` |
| `./default-theme` | `@fluentui-react-native/default-theme` |
| `./theme-tokens` | `@fluentui-react-native/theme-tokens` |
| `./theme-types` | `@fluentui-react-native/theme-types` |
| `./theming-utils` | `@fluentui-react-native/theming-utils` |
| `./win32-theme` | `@fluentui-react-native/win32-theme` |

#### Utilities (4)

| Subpath | Package |
|---------|---------|
| `./adapters` | `@fluentui-react-native/adapters` |
| `./interactive-hooks` | `@fluentui-react-native/interactive-hooks` |
| `./styling-utils` | `@fluentui-react-native/styling-utils` |
| `./tokens` | `@fluentui-react-native/tokens` |

#### Deprecated (8)

| Subpath | Package |
|---------|---------|
| `./foundation-composable` | `@uifabricshared/foundation-composable` |
| `./foundation-compose` | `@uifabricshared/foundation-compose` |
| `./foundation-settings` | `@uifabricshared/foundation-settings` |
| `./foundation-tokens` | `@uifabricshared/foundation-tokens` |
| `./theme-registry` | `@uifabricshared/theme-registry` |
| `./themed-settings` | `@uifabricshared/themed-settings` |
| `./theming-ramp` | `@uifabricshared/theming-ramp` |
| `./theming-react-native` | `@uifabricshared/theming-react-native` |

## Design

- **ESM only** — all exports use `import` conditions (no CommonJS `require`). This ensures optimal tree-shaking.
- **`sideEffects: false`** — bundlers can safely eliminate unused re-exports.
- **Two import levels** — individual subpaths for precise control; category barrels for convenience. There is no top-level `import * from 'fluentui-react-native'` barrel.
- **Auto-generated** — all exports, dependencies, and source files are generated by `update-exports.mts`. Run `yarn update-exports` after adding a new package to the monorepo.
- **CI-enforced** — `yarn check-exports` runs in CI and fails if a publishable package is missing.

## Maintainer Guide

When adding a new package to the monorepo:

1. Create the package as usual under `packages/`
2. Run `yarn update-exports` from this directory (or `yarn lage check-exports` will remind you)
3. Commit the generated `src/` files and updated `package.json`

The script automatically:
- Discovers all publishable (non-private) packages under `packages/`
- Creates individual re-export files (`src/<subpath>/index.ts`)
- Creates category barrel files (`src/<category>/index.ts`)
- Updates `package.json` exports and dependencies fields
- Detects and removes stale entries for deleted packages
