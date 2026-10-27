---
id: storybook-desktop-runtime.contract
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop-runtime
---

# Runtime contract

## Bridge and readiness

The app and story root expose native test-ID markers and app-manifest-derived
identity. Runtime hello challenges authenticate with a private nonce; story
ready/error events correlate instance, target, request/run IDs, and preview
generation. Each named test gets a keyed preview remount. Preserve these
contracts and fail closed on stale or uncorrelated messages.

## Theme and chrome

One `ThemedRoot` covers the app, toolbar, and chrome. Theme changes update the
preview and chrome without replacing the Storybook instance. macOS and Windows
keep upstream LiteUI; Win32 uses the package's desktop chrome with persistent
resizable sidebar, story preview, bottom addon panel, and optional
Callout-backed pop-outs. Do not add mobile drawer portals or window-dimension
assumptions to the Win32 host.

The toolbar selects four independent axes from inline dropdown menus:

| Axis     | Test-ID segment | Values                                                                                 |
| -------- | --------------- | -------------------------------------------------------------------------------------- |
| Theme    | `source`        | `flex` (the design package's Flex defaults) or `fluent` (the legacy default theme)     |
| Scheme   | `scheme`        | `light`, `dark`, or `system`, which follows the platform appearance                    |
| Contrast | `contrast`      | `standard` or `highContrast`                                                           |
| Tone     | `tone`          | `cool` or `warm`; Flex only, so it is disabled and reports `cool` for the Fluent theme |

Both sources receive the selection as one structured appearance request, so a
selection never constructs a new theme reference. The default, Flex, light,
standard, and cool, does not depend on the host appearance. The toolbar is
`<prefix>-theme-toolbar`; each axis trigger is a combobox with test ID
`<prefix>-theme-<segment>` that reports its value and expanded state; its open
menu is `<prefix>-theme-<segment>-menu`; and each option is
`<prefix>-theme-<segment>-<value>`. One menu is open at a time, and selecting
an option closes it. Native story tests can select a theme configuration
through these IDs before asserting.

Opaque platform colors may be unusable by Storybook JavaScript color
utilities. Preserve native tokens; use the documented contrasting theme color
fallback for the chrome and warn when substituting. Keep story background
overrides higher priority than defaults.

## Metro and source ownership

`config/metro.cjs` composes resolver behavior and generates the runtime
polyfill when evaluated. Treat loading it as a write-capable operation. Tests
and diagnostics should use the package's owning app scripts and inspect only
the generated files they need.

React Native platform variations belong in platform-specific files. Build and
test through the consuming Storybook workspace for the affected endpoint.
