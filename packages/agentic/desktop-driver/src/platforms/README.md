# Platform extensions

The platform modules expose explicit, non-portable execute extensions.

- `macos.ts` contains Mac2 prerequisite checks and macOS-only operations.
- `windows.ts` contains NovaWindows prerequisite checks and Windows-only operations.

Shared tests must not import these subpaths. A platform extension is appropriate only when the
operation cannot belong to the versioned portable command matrix.

Termination-capable extensions must verify observed `self` ownership and fail closed for attached
applications. Platform fork types remain isolated from the neutral package graph.
