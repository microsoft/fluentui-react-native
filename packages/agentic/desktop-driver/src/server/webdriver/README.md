# Native WebDriver host

This submodule isolates one native backend behind one loopback W3C endpoint.

## Process boundary

`client.ts` allocates a port, writes an allowlisted config, starts `host-main.ts`, waits for a
bounded ready message, captures logs, watches termination, and performs owned cleanup.

`host-main.ts` validates protocol version, backend, loopback host, explicit port, and parent PID.
It starts exactly one backend and exits when its parent disappears or requests shutdown.

## Backends

- `backends.ts` is the only Appium driver-author import boundary.
- Mac2 uses `appium-mac2-driver`.
- Windows uses `appium-novawindows-driver`.
- `fake-driver.ts` implements the deterministic contract backend.
- `w3c-server.ts` is the package-owned route host used by fake and retained as the stable hosting
  boundary for future Appium changes.

The child strips inherited loader hooks from `NODE_OPTIONS`, bounds startup buffers, removes
temporary work directories it owns, and never imports a React Native platform fork.
