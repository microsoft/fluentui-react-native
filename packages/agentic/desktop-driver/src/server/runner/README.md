# WDIO runner subprocess

This module turns allowlisted manifest entries into one owned WebdriverIO invocation.

## Invocation

- command, arguments, working directory, timeout, and environment come from resolved host config;
- requests contribute only story IDs already present in the manifest;
- selected specs are deduplicated;
- exact story grep values are combined for one warm run; and
- Windows launchers are resolved through `PATH`/`PATHEXT` and invoked through explicitly quoted
  `cmd.exe`, never `shell: true`.

## Progress

`reporter-protocol.ts` defines a private line protocol emitted from the WDIO worker's `afterTest`
hook. The parser tolerates WDIO's `[cid]` log prefix and streams framework-level results to the
coordinator before process exit. Completed run artifacts remain the final source of truth.

Cancellation and timeout stop the exact owned process tree. A failed termination is an
infrastructure error, not a successful cancellation.
