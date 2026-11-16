---
id: storybook-desktop.macos
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Storybook on macOS

macOS defaults to Fabric; `--paper` selects Paper. Regenerate Pods/project
with `prep` whenever switching renderer because both modes share the generated
project.

Run the application bundle before `prep` when CocoaPods must embed a JavaScript
bundle or other resource. CocoaPods includes only resources present during
`pod install`. Use `yarn storybook prep --macos`, `bundle --macos`,
`build --macos`, and `smoke --macos`. A failed step prints the end of its log and
the log's path; use `--verbose` to stream native diagnostics live instead. Do
not patch generated Pod sources or workspace files.

Storybook app diagnostics and native permissions are documented in the
consumer's agent entry point and the repository permissions reference. Only
the app's Podfile is hand-authored; generated Pods and DerivedData remain
disposable.

Physical-lane runs use the deterministic window setup described in
[commands](../commands.md), rather than relying on a previously persisted
window frame. Other input lanes retain their existing geometry behavior.
