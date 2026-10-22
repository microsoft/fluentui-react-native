---
id: storybook-desktop.win32
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Storybook on Win32

Win32 is the prebuilt REX Paper host. Bundle before run; native app build is
unsupported. Use `yarn storybook bundle --win32` and `yarn storybook smoke
--win32 --mode stories` (or `stories-and-tests`).

Keep app-owned story inclusion in `desktop.config.mts`. The shared runtime
uses desktop chrome for Win32 because the host does not provide normal window
dimensions. Preserve its persistent sidebar, preview, bottom addon panel, and
Callout-backed pop-outs. Keep the REX Unicode-regex compatibility transform
scoped to Win32 until its engine supports Unicode property escapes.

Do not reintroduce mobile drawer/portal behavior or claim a native build for
the prebuilt endpoint.
