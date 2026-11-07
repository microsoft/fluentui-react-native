# @fluentui-react-native/desktop-driver-mcp

## 0.1.2

### Patch Changes

- Updated dependencies [8574d22]
  - @fluentui-react-native/desktop-driver@0.5.1

## 0.1.1

### Patch Changes

- bac8b51: Add the `desktop_story` tool, which lists Storybook stories and renders one through the driver's story operations.
- bac8b51: Add the Desktop Driver MCP adapter: five tools (`desktop_session`, `desktop_observe`, `desktop_act`, `desktop_check`, `desktop_capture`) over the driver's agent operations, connected through a verified private descriptor, with session-scoped capture resources, progress, and cancellation.
- bac8b51: Serialize MCP connection and session lifetimes, reverify authority after transport failures, and fence ambiguous acquisitions. Discover target launch modes, quarantine uncertain story changes, refuse ungoverned args updates on protected services, and retain workload claims after uncertain cleanup. Document the work-in-progress layering and package-owned capability, qualification, and measurement status.
- bac8b51: Add `desktop-test serve --agent`, which protects the served target with a grant authority and publishes the private connection descriptor the Desktop Driver MCP adapter reads.
- d50b1ea: Separate driver, declared-workload, and recovery grant scopes. Add bounded,
  attenuated connection principals and awaitable descendant revocation with
  retryable terminal-only cleanup proof. Isolate MCP sessions per connection and
  keep descriptor credentials out of diagnostics.
- 0cfecf0: Add a dedicated native helper entry to desktop-driver and enforce the neutral desktop package dependency boundary with standalone consumer contracts.
- bac8b51: Add bounded observation paging and deltas; extend the prior macOS M3 evidence record.
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [d50b1ea]
- Updated dependencies [0cfecf0]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [cd0ede2]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
  - @fluentui-react-native/desktop-driver@0.5.0
