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

The version-2 challenge/hello binds a fresh connection epoch. Prepare messages
carry that epoch and a strictly increasing selection sequence. A synchronous
selection ref fences callbacks from superseded React trees before effects can
commit. Version-1 ready events and native marker JSON share the data-only
`storyMarker.ts` producer: `connectionEpoch`, `markerVersion`,
`previewGeneration`, `requestId`, `runId`, and `storyId`. The driver tests
the actual producer against its verifier without Node globals.

Cancellation retains a canceled selection, hides its story content, and
suppresses ready/error callbacks; old prepares cannot revive it. Channel
disconnect cancels the current selection. A replacement epoch rejects
previous-epoch messages, but this runtime does not add transport reconnect.
Different-story late trees are hidden; upstream same-story navigation has no
request identity and cannot be proven fenced. The driver therefore retains
unknown-effect quarantine after interrupted navigation, even after a new
hello. Keep this boundary explicit rather than claiming transparent recovery.

Win32 remounts the entire preview subtree for each test generation, including
the story viewport, so retained scroll position cannot put the next test's
controls behind the chrome. Sidebar and addon preferences remain outside that
remount.

The macOS and Win32 story decorators use a scrollable viewport with
naturally sized content. Small stories remain centered; oversized stories
start within the viewport and can scroll instead of overflowing behind the
chrome. The content container grows to fill short previews, rather than
fixing tall stories to the viewport height. Native keyboard focus can scroll
later controls into view without changing their size.
Windows retains its non-scrolling, fixed-height centered story container;
the macOS viewport does not wrap Windows stories or nest their scrollers.

## Theme and chrome

One Flex `ThemedRoot` covers the app, toolbar, and chrome, so the Storybook
chrome and story canvas always use the Flex theme. Story content receives the
selected theme through a nested `ThemeProvider` that adds no view and shares the
root's input modality. Theme changes update the preview and chrome without
replacing the Storybook instance. macOS and Windows keep upstream LiteUI; Win32
uses the package's desktop chrome with persistent resizable sidebar, story
preview, bottom addon panel, and optional Callout-backed pop-outs. Do not add
mobile drawer portals or window-dimension assumptions to the Win32 host.

The toolbar selects four independent axes from inline dropdown menus:

| Axis     | Test-ID segment | Values                                                                                                  |
| -------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| Theme    | `source`        | Story theme: `flex` (the design package's Flex defaults) or `fluent` (the legacy default theme)         |
| Scheme   | `scheme`        | `light`, `dark`, or `system`, which follows the platform appearance                                     |
| Contrast | `contrast`      | `standard` or `highContrast`                                                                            |
| Tone     | `tone`          | `cool` or `warm`; Flex only, so it is disabled and reports `cool` for the Fluent theme, chrome included |

The chrome and story themes receive the selection as one structured appearance
request, so a selection never constructs a new theme reference. The default,
Flex, light, standard, and cool, does not depend on the host appearance. The
toolbar is `<prefix>-theme-toolbar`; each axis trigger is a combobox with test
ID `<prefix>-theme-<segment>` that reports its value and expanded state; its
open menu is `<prefix>-theme-<segment>-menu`; and each option is
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
