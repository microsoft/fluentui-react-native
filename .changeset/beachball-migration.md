---
"@fluentui-react-native/adapters": patch
"@fluentui-react-native/android-theme": patch
"@fluentui-react-native/apple-theme": patch
"@fluentui-react-native/avatar": patch
"@fluentui-react-native/badge": patch
"@fluentui-react-native/button": patch
"@fluentui-react-native/callout": patch
"@fluentui-react-native/checkbox": patch
"@fluentui-react-native/chip": patch
"@fluentui-react-native/codemods": patch
"@fluentui-react-native/composition": patch
"@fluentui-react-native/contextual-menu": patch
"@fluentui-react-native/default-theme": patch
"@fluentui-react-native/divider": patch
"@fluentui-react-native/drawer": patch
"@fluentui-react-native/dropdown": patch
"@fluentui-react-native/experimental-activity-indicator": patch
"@fluentui-react-native/experimental-appearance-additions": patch
"@fluentui-react-native/experimental-avatar": patch
"@fluentui-react-native/experimental-checkbox": patch
"@fluentui-react-native/experimental-expander": patch
"@fluentui-react-native/experimental-menu-button": patch
"@fluentui-react-native/experimental-native-date-picker": patch
"@fluentui-react-native/experimental-native-font-metrics": patch
"@fluentui-react-native/experimental-shadow": patch
"@fluentui-react-native/experimental-shimmer": patch
"@fluentui-react-native/focus-trap-zone": patch
"@fluentui-react-native/focus-zone": patch
"@fluentui-react-native/framework": patch
"@fluentui-react-native/framework-base": patch
"@fluentui-react-native/icon": patch
"@fluentui-react-native/immutable-merge": patch
"@fluentui-react-native/input": patch
"@fluentui-react-native/interactive-hooks": patch
"@fluentui-react-native/link": patch
"@fluentui-react-native/memo-cache": patch
"@fluentui-react-native/menu": patch
"@fluentui-react-native/menu-button": patch
"@fluentui-react-native/merge-props": patch
"@fluentui-react-native/notification": patch
"@fluentui-react-native/overflow": patch
"@fluentui-react-native/persona": patch
"@fluentui-react-native/persona-coin": patch
"@fluentui-react-native/popover": patch
"@fluentui-react-native/pressable": patch
"@fluentui-react-native/radio-group": patch
"@fluentui-react-native/separator": patch
"@fluentui-react-native/spinner": patch
"@fluentui-react-native/stack": patch
"@fluentui-react-native/styling-utils": patch
"@fluentui-react-native/switch": patch
"@fluentui-react-native/tablist": patch
"@fluentui-react-native/text": patch
"@fluentui-react-native/theme": patch
"@fluentui-react-native/theme-tokens": patch
"@fluentui-react-native/theme-types": patch
"@fluentui-react-native/themed-stylesheet": patch
"@fluentui-react-native/theming-utils": patch
"@fluentui-react-native/tokens": patch
"@fluentui-react-native/tooltip": patch
"@fluentui-react-native/use-slot": patch
"@fluentui-react-native/use-slots": patch
"@fluentui-react-native/use-styling": patch
"@fluentui-react-native/use-tokens": patch
"@fluentui-react-native/vibrancy-view": patch
"@fluentui-react-native/win32-theme": patch
"@fluentui/react-native": patch
"@uifabricshared/foundation-composable": patch
"@uifabricshared/foundation-compose": patch
"@uifabricshared/foundation-settings": patch
"@uifabricshared/foundation-tokens": patch
"@uifabricshared/theme-registry": patch
"@uifabricshared/themed-settings": patch
"@uifabricshared/theming-ramp": patch
"@uifabricshared/theming-react-native": patch
---

# Migration from Beachball to Changesets

This changeset represents the migration from Beachball to Changesets for version management and consolidates all changes from 440+ beachball change files that were in the `change/` directory.

All 75 affected packages receive a patch version bump to acknowledge the accumulated changes from the beachball era.

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
