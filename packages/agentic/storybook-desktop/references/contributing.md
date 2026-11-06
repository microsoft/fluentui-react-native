---
id: storybook-desktop.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Contributing

Configuration and platform adapters live under `src/config/`; manifest
extraction and target identity live under `src/driver/`; command lifecycle
and service ownership live under `src/cli/`; CSF callback extraction and worker
execution live under `src/testing/`.

The channel child in `config/server.cjs` constructs its native driver through
`@fluentui-react-native/desktop-test/driver-service`. Keep recovery storage,
helper policy, authority, descriptor publication and settled driver shutdown
in that shared harness implementation, not a parallel Storybook copy.

Keep story callbacks statically extractable and authentication checks
fail-closed. Update references when commands, supported config, outputs, or
readiness contracts change.

Authenticated bridge epochs are recorded by `BridgeEpochJournal` in the
service factory's private endpoint/target namespace, separately from settlement
and quarantine. The record binds renderer and epoch to a native-verified PID
and process start time. Identity resolution uses a temporary attached helper,
disposed without closing the app or altering an active session's window records.
Readiness remains disabled until the record is published; a missing startup
lease can be retried on the next story command, never assumed verified.
After a service restart, only a matching record, a `running` exact-incarnation
probe, and a matching current native attachment justify `relaunch-required`.
Initial absence, an unknown/failed probe, or a replaced process stays
`bridge-unavailable`, with no navigation dispatched. Proven exited/replaced
records are removed; reauthentication replaces the old epoch. Neither record
nor relaunch guidance clears settlement quarantine or promises transparent
upstream reconnection.

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` from this
package. Validate static manifests and the affected app's bundle/native smoke
when changing runtime behavior.
