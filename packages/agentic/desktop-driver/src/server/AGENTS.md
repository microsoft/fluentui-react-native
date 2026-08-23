# Server module agent guidance

Read [README.md](./README.md) and the nearest child README before editing.

## Ownership

This module owns listeners, run coordination, runner subprocesses, native WebDriver child
processes, IPC, deadlines, and shutdown.

Preserve:

- loopback-only binding;
- one active run;
- manifest-constrained story IDs;
- exact process ownership;
- attach preservation;
- idempotent bounded shutdown;
- cleanup failure aggregation; and
- isolation of broken clients from run state.

Appium driver-author imports stay only in `webdriver/backends.ts`. The server must not import the
WDIO service layer.

## Submodules

- `channel/`: Storybook channel/client adaptation; no executable values from the app.
- `runner/`: one owned WDIO process, live result stream, timeout, and process-tree cancellation.
- `webdriver/`: isolated native host and W3C routes.

## Documentation

Update `DESIGN.md` for topology, lifecycle, ownership, or security changes. Update `USAGE.md` for
host/supervisor behavior and the owning submodule README for implementation boundaries.

Any new child submodule needs its own README and, when constraints differ, an AGENTS file.

## Validation

Cover startup, failure, cancellation, timeout, shutdown, client failure, parent death, malformed
requests, and false-green prevention. Real native process behavior remains a Phase 6 gate.
