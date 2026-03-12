#!/bin/bash
# Push branch and create PR for the unified mono-package.
# Run from the repo root.

set -euo pipefail

BRANCH="feat/unified-mono-package"
TITLE="feat: Add unified fluentui-react-native mono-package with subpath exports"

BODY='## Summary

Adds a new `fluentui-react-native` package that re-exports every publishable package in the monorepo via [subpath exports](https://nodejs.org/api/packages.html#subpath-exports). Consumers can depend on a single package and import from any component:

```ts
// Individual subpaths (1:1 with @fluentui-react-native/* packages)
import { Button } from '\''fluentui-react-native/button'\'';
import { ThemeProvider } from '\''fluentui-react-native/theme'\'';

// Category barrels for convenience
import { Button, Avatar, Menu } from '\''fluentui-react-native/components'\'';
import { ThemeProvider } from '\''fluentui-react-native/core'\'';
```

The existing `@fluentui-react-native/*` packages are unchanged — this is purely additive.

## What'\''s included

- **70 individual subpath exports** — one per publishable package
- **6 category barrels** — `./components` (25), `./experimental` (17), `./core` (9), `./theming` (7), `./deprecated` (8), `./utils` (4)
- **ESM-only**, `sideEffects: false`, fully tree-shakeable
- **Auto-generation script** (`update-exports.mts`) discovers packages and generates exports, with `--check` mode for CI enforcement
- **CI enforcement** via `check-exports` task in the `buildci` pipeline

## New files

| File | Purpose |
|------|---------|
| `packages/libraries/fluentui-react-native/package.json` | Manifest with 76 subpath exports |
| `packages/libraries/fluentui-react-native/update-exports.mts` | Script to generate src/, lib/, and sync package.json |
| `packages/libraries/fluentui-react-native/src/*.ts` | 6 category barrel source files (checked in) |
| `packages/libraries/fluentui-react-native/README.md` | Usage, migration guide, and full subpath catalog |

## Infrastructure changes

| File | Change |
|------|--------|
| `lage.config.mjs` | Added `check-exports` task to `buildci` pipeline |
| `scripts/src/tasks/lintPackage.ts` | Skip `"."` export validation for subpath-only packages; skip `default` entry enforcement when source file doesn'\''t exist |
| `scripts/src/utils/buildConfig.ts` | Suppress CJS build for `type: "module"` packages without `main` |

## How it works

`yarn build` runs `update-exports.mts` which:
1. Scans the monorepo for all publishable packages
2. Writes 6 category barrel `.ts` files to `src/` (checked in, human-readable)
3. Generates `lib/*.js` + `lib/*.d.ts` directly (70 individual + 6 barrel = 76 pairs)
4. Updates `package.json` exports and dependencies fields

`yarn check-exports` (CI) verifies `src/` and `package.json` stay in sync — if a new package is added to the monorepo, the build will fail until `yarn update-exports` is run.'

# Push and create PR
git push -u origin "$BRANCH"
gh pr create --title "$TITLE" --body "$BODY" --base main
