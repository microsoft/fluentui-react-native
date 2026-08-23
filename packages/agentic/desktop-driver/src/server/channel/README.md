# Storybook channel adapter

The channel submodule isolates Storybook's runtime control surface.

- `client.ts` calls the maintained Storybook HTTP endpoints for index, selection, and args. Every
  request is bounded by the remaining render deadline.
- `bridge.ts` maps versioned channel messages to `RunCoordinator` calls and publishes ready,
  closing, progress, terminal status, and cancellation behavior.

The bridge validates service identity, protocol version, manifest digest, request IDs, story IDs,
and status sequence numbers. One broken socket is isolated and cannot change a test result or block
healthy clients.

This module may depend on the protocol and coordinator, but it must not accept commands, paths,
grep expressions, or executable values from the app.
