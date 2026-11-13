---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/desktop-driver-mcp': patch
---

Add attach-only scoped runner grants, drain-confirmed MCP relinquish and standalone WDIO handoff, with parent-owned worker-crash cleanup and private credential transport. Bound live/draining grant authority separately from settled cleanup history, preserve shared descriptor roots during preemption, and allow preempted MCP controllers to reopen with fresh authority. Deliver worker credentials individually and scrub them before user hooks/specs and their children run; Node bootstrap remains trusted. Storybook handoff and retained launched applications remain unsupported.
