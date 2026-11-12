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

Agent manifests use `config/controlled-channel.cjs`, not upstream
`createChannelServer`: only public index generation is reused. Do not add a
WebSocket relay or an HTTP mutation route to this adapter. Runtime events must
remain socket/epoch authenticated, navigation uses driver-owned settlement,
and protected args stay refused. Manifest-backed smoke traversal must acquire
and release its driver session before authored test sessions start.

## Generated manifest trust

`config/generated-contract.cjs` is the dependency-free source of the strict
driver-manifest version 3, private-credential version 1, and parent-handoff
version 1 schemas. Unknown generated fields fail, and authored plans and case
options remain validated by their owning desktop-driver validators. Extracted
case options retain their separately validated `inputSource` metadata.

The public generated JSON contains credential references, never either nonce.
`src/driver/generatedManifest.ts` publishes a credential record and bridge-only
runtime data module through desktop-driver's owner-private storage adapter:
POSIX directory/file modes `0700`/`0600` with ownership/ACL checks on macOS,
and the native owner/DACL/reparse/root-identity boundary on Windows.
Application attachment leases stay in that private namespace. Their random nonce
is independent of the runtime bridge nonce; the lease nonce never reaches Metro.
Publication resolves the existing generated directory once, so symlinked project
paths and macOS `/var` aliases work without weakening subsequent ancestor checks.
Windows and Win32 smoke scripts pass OS-observed identity to
`config/application-lease.cjs`, which verifies the parent handoff before opening
private storage and publishes/removes leases through its protected DACL boundary.
Scripts retain only a digest receipt; replacement and cleanup cannot overwrite
or remove a different lease. Smoke control reads the shared strict version-3
public schema, without hydrating credentials.

The parent resolves the native helper independently and passes its artifact
plus manifest, credential, and runtime-module hashes through inherited
`STORYBOOK_DRIVER_HANDOFF`. The actual channel child rejects a mismatched
manifest before verifying or spawning that helper, including before opening
Windows private storage. A hash inside the editable manifest is not authority.
Metro receives the canonical schema locator through the parent's
`STORYBOOK_GENERATED_CONTRACT`, verifies the manifest and private data module
against the handoff, and never reconstructs credentials from public JSON.
The locator is trusted process configuration, not a manifest-controlled path.
This keeps the integration CLI peer-free; the runtime remains app-owned.

Do not launch a native channel by copying only a generated manifest or by
inventing a handoff from its fields. Use the owning CLI lifecycle. The explicit
fake-driver fixture mode has no native helper or credentials and is not a
production trust path. Exercise Metro evaluation only under controlled fixture
roots because its legacy, non-driver path still generates a runtime data module.
Generated modules contain only `export default <JSON>`; executable loader
source stays constant and obtains the data through Metro's resolver.

Input lanes cross these areas. The descriptor schema, merge, and per-case
decision belong to `@fluentui-react-native/desktop-driver/authoring`; do not
copy them here. `src/cli/inputLane.ts` resolves the requested lane,
`src/testing/selection.ts` decides every case before launch and renders
`test --list`, `src/testing/laneVerdict.ts` judges a lane run's accounting, and
`config/server.cjs` masks the accessible lane's physical input on the driver.
`config/transform-story-tests.cjs` is both the Metro Babel plugin and the shared
AST library: its `rejectDirectInput` check runs from `src/testing/extractWdioTests.ts`
only, because the Metro transform has no validated descriptor to judge by.

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
