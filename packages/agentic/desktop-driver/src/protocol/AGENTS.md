# Protocol module agent guidance

Read [README.md](./README.md) before editing this module.

## Hard boundary

This module must remain safe to bundle into React Native:

- no `node:` imports;
- no Storybook Node, WDIO, server, Appium, or platform-driver imports;
- no command lines, filesystem paths, environment values, tokens, stacks, or unrestricted backend
  data in payloads.

## Changes

Update types, constants, and decoders together. Both host and app must use the same runtime decoder.
An incompatible wire change requires a `DESKTOP_PROTOCOL_VERSION` bump.

Status sequence numbers must remain monotonic. Run requests must carry service identity, request
identity, manifest digest, and only allowlisted story IDs.

## Documentation and validation

Update package `DESIGN.md`, `USAGE.md`, this module `README.md`, and
`apps/storybook/src/desktopTestProtocol.test.ts`.

Add positive and negative codec tests for every new field. Run the Storybook workspace tests and
both bundles after changing this surface.
