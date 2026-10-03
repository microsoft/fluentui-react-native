---
'@fluentui-react-native/storybook-desktop': minor
'@fluentui-react-native/components': patch
---

Add a macOS-only `--paper` option to prepare, build, launch, and smoke test Storybook with Paper while preserving Fabric as the default renderer.

Use centered alignment in macOS Paper CompoundItemLayout stories to avoid the native Yoga baseline crash without changing the primitive or Fabric demonstrations.

Measure LayoutStableText's hidden reserve Text directly in native alignment stories, avoiding Paper Text-versus-View pixel-rounding mismatches without relaxing the geometry assertions.
