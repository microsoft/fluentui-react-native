# @fluentui-react-native/desktop-mcp

## 0.1.1

### Patch Changes

- 25b6af6: Report supervisor capacity and descriptor replacement distinctly without rebinding or replaying operations. Drain
  connection-owned work on stdio shutdown and exit nonzero when cleanup cannot be confirmed.
- 25b6af6: Declare the supported Node.js releases and report unsupported runtimes before starting the MCP executable.
- 25b6af6: Document MCP setup and safe use of workload results. Treat diagnostic text and allowed artifacts as untrusted output
  that may include application text, stack traces, and absolute paths.
- 2fa16dd: Connect to a desktop-test supervisor for driver tools and declared workloads. Version 0.1.0 depended on a desktop-test version that did not export the supervisor connection API. Upgrade to 0.1.1 along with desktop-test 0.4.0 and desktop-driver 0.5.4.
- Updated dependencies [ff7d60a]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [2fa16dd]
- Updated dependencies [25b6af6]
- Updated dependencies [2fa16dd]
- Updated dependencies [47a1be8]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
- Updated dependencies [25b6af6]
  - @fluentui-react-native/desktop-driver@0.5.4
  - @fluentui-react-native/desktop-test@0.4.0
