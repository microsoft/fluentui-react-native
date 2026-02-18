---
"@fluentui-react-native/adapters": minor
"@fluentui-react-native/android-theme": minor
"@fluentui-react-native/apple-theme": minor
"@fluentui-react-native/avatar": minor
"@fluentui-react-native/badge": minor
"@fluentui-react-native/button": minor
"@fluentui-react-native/callout": minor
"@fluentui-react-native/checkbox": minor
"@fluentui-react-native/chip": minor
"@fluentui-react-native/codemods": minor
"@fluentui-react-native/composition": minor
"@fluentui-react-native/contextual-menu": minor
"@fluentui-react-native/default-theme": minor
"@fluentui-react-native/divider": minor
"@fluentui-react-native/drawer": minor
"@fluentui-react-native/dropdown": minor
"@fluentui-react-native/experimental-activity-indicator": minor
"@fluentui-react-native/experimental-appearance-additions": minor
"@fluentui-react-native/experimental-avatar": minor
"@fluentui-react-native/experimental-checkbox": minor
"@fluentui-react-native/experimental-expander": minor
"@fluentui-react-native/experimental-menu-button": minor
"@fluentui-react-native/experimental-native-date-picker": minor
"@fluentui-react-native/experimental-native-font-metrics": minor
"@fluentui-react-native/experimental-shadow": minor
"@fluentui-react-native/experimental-shimmer": minor
"@fluentui-react-native/focus-trap-zone": minor
"@fluentui-react-native/focus-zone": minor
"@fluentui-react-native/framework": minor
"@fluentui-react-native/framework-base": minor
"@fluentui-react-native/icon": minor
"@fluentui-react-native/immutable-merge": minor
"@fluentui-react-native/input": minor
"@fluentui-react-native/interactive-hooks": minor
"@fluentui-react-native/link": minor
"@fluentui-react-native/memo-cache": minor
"@fluentui-react-native/menu": minor
"@fluentui-react-native/menu-button": minor
"@fluentui-react-native/merge-props": minor
"@fluentui-react-native/notification": minor
"@fluentui-react-native/overflow": minor
"@fluentui-react-native/persona": minor
"@fluentui-react-native/persona-coin": minor
"@fluentui-react-native/popover": minor
"@fluentui-react-native/pressable": minor
"@fluentui-react-native/radio-group": minor
"@fluentui-react-native/separator": minor
"@fluentui-react-native/spinner": minor
"@fluentui-react-native/stack": minor
"@fluentui-react-native/styling-utils": minor
"@fluentui-react-native/switch": minor
"@fluentui-react-native/tablist": minor
"@fluentui-react-native/text": minor
"@fluentui-react-native/theme": minor
"@fluentui-react-native/theme-tokens": minor
"@fluentui-react-native/theme-types": minor
"@fluentui-react-native/themed-stylesheet": minor
"@fluentui-react-native/theming-utils": minor
"@fluentui-react-native/tokens": minor
"@fluentui-react-native/tooltip": minor
"@fluentui-react-native/use-slot": minor
"@fluentui-react-native/use-slots": minor
"@fluentui-react-native/use-styling": minor
"@fluentui-react-native/use-tokens": minor
"@fluentui-react-native/vibrancy-view": minor
"@fluentui-react-native/win32-theme": minor
"@fluentui/react-native": minor
"@uifabricshared/foundation-composable": minor
"@uifabricshared/foundation-compose": minor
"@uifabricshared/foundation-settings": minor
"@uifabricshared/foundation-tokens": minor
"@uifabricshared/theme-registry": minor
"@uifabricshared/themed-settings": minor
"@uifabricshared/theming-ramp": minor
"@uifabricshared/theming-react-native": minor
---

# Migration from Beachball to Changesets

This changeset represents the migration from Beachball to Changesets for version management and consolidates all changes from 440+ beachball change files that were in the `change/` directory.

All 75 affected packages receive a minor version bump to acknowledge the accumulated changes from the beachball era.

## What Changed

Going forward, all version management uses Changesets via `yarn changeset`. The following beachball infrastructure has been removed:

- ❌ 440+ beachball change files from `change/` directory
- ❌ `beachball` package dependency
- ❌ Beachball scripts from `package.json`
- ❌ `beachball.config.js` configuration file
- ❌ Beachball publish steps from Azure Pipelines

## New Workflow

✅ **Create changes**: Run `yarn changeset` to document changes
✅ **Version bump PRs**: Automatically created by GitHub Actions
✅ **Publishing**: Handled by Azure Pipelines using `changeset publish`
✅ **Validation**: CI validates changesets and blocks major version bumps

For details, see `CHANGESETS_SETUP.md` and `CONTRIBUTING.md`.
