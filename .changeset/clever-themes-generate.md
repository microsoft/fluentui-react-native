---
"@fluentui-react-native/design": minor
"@fluentui-react-native/default-theme": patch
"@fluentui-react-native/apple-theme": patch
"@fluentui-react-native/win32-theme": patch
"@fluentui-react-native/framework": patch
"@fluentui-react-native/dependency-profiles": patch
"@uifabricshared/foundation-compose": patch
"@uifabricshared/theming-react-native": patch
---

Generate appearance-aware theme defaults, projections, aliases, shadows, and
compatibility globals at build time. Move the default-theme implementation
into design, retain the original package as a compatibility shim, and remove
runtime design-token JSON dependencies.
