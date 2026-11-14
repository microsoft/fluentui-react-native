# @fluentui-react-native/desktop-driver-mcp

## 0.1.4

### Patch Changes

- f2a3037: Add attach-only scoped runner grants, drain-confirmed MCP relinquish and standalone WDIO handoff, with parent-owned worker-crash cleanup and private credential transport. Bound live/draining grant authority separately from settled cleanup history, preserve shared descriptor roots during preemption, and allow preempted MCP controllers to reopen with fresh authority. Deliver worker credentials individually and scrub them before user hooks/specs and their children run; Node bootstrap remains trusted. Storybook handoff and retained launched applications remain unsupported.
- Updated dependencies [1b42a88]
- Updated dependencies [c57dcd8]
- Updated dependencies [f2a3037]
- Updated dependencies [041ac8b]
- Updated dependencies [9a66d89]
- Updated dependencies [f2a3037]
  - @fluentui-react-native/desktop-driver@0.5.3

## 0.1.3

### Patch Changes

- Updated dependencies [f14e254]
- Updated dependencies [1c38e27]
- Updated dependencies [586e4c3]
- Updated dependencies [8b3a2cc]
- Updated dependencies [f52682c]
- Updated dependencies [6404535]
- Updated dependencies [6404535]
- Updated dependencies [6b644ce]
- Updated dependencies [3b2787e]
  - @fluentui-react-native/desktop-driver@0.5.2

## 0.1.2

### Patch Changes

- 26cc577: Record partial combined-candidate macOS native qualification evidence.
- 26cc577: Document the provisional macOS native qualification evidence and integrated
  descriptor-path requalification procedure.
- 26cc577: Repair Windows package-boundary validation, tolerate bounded atomic-report
  sharing conflicts without hiding persistent failures, and record descriptor-path cleanup,
  correlated render faults, recovery, and separate legacy smoke evidence, retaining
  earlier failures and partial native coverage.
- 319d38c: Record Windows Fabric and Win32 Paper launch, containment, and MCP measurement evidence, and document the Win32 agent-mode bundle, the Windows foreground refusal, and the `serve --agent` interrupt behavior.
- 26cc577: Record Windows Fabric and Win32 Paper native qualification results in the
  status ledgers and add Windows parameters to the native qualification runbook.
- Updated dependencies [26cc577]
- Updated dependencies [da2b62c]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [8574d22]
- Updated dependencies [ac20660]
- Updated dependencies [26cc577]
- Updated dependencies [319d38c]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
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
