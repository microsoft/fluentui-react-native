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
