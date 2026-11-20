---
"@fluentui-react-native/desktop-driver-mcp": patch
---

Move the deprecated desktop-driver-mcp compatibility package to packages/shims
and add explicit deprecation metadata and migration instructions. Use
@fluentui-react-native/desktop-mcp instead; desktop-mcp --driver-only preserves
the existing executable's driver-only behavior and discovery.
