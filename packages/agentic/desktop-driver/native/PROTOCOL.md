# Desktop Driver native host protocol

FDR1 is the private protocol between the Node `NativeDesktopHost` adapter and
one long-lived operating-system helper. It is not a public remote API and is
not exposed to WebDriver clients.

The protocol uses inherited stdin/stdout. The helper opens no listener, receives
no WebDriver capabilities, and cannot choose arbitrary applications or
artifact paths. Stderr is reserved for bounded human-readable diagnostics.

## Versions and startup

The checked-in machine-readable version is [protocol.json](protocol.json):

```json
{
  "wireProtocol": {
    "major": 1,
    "minor": 0
  }
}
```

Before selecting an artifact, Node invokes:

```text
furn-desktop-driver-host --handshake --json
```

That one-shot process writes an unframed JSON `hello` document and exits. Node
verifies provider, architecture, build ID, source digest, features, and
protocol.

For service operation, Node invokes:

```text
furn-desktop-driver-host --stdio
```

The long-lived process first emits a framed `hello`. Its major version must
equal Node's major version and its minor version must be at least the required
minor. The actual long-lived process must identify the same verified artifact;
a successful one-shot probe cannot substitute for this handshake.

## Frame format

Every long-lived frame starts with a 12-byte little-endian header:

| Offset | Size | Value                            |
| ------ | ---- | -------------------------------- |
| 0      | 4    | ASCII `FDR1`                     |
| 4      | 1    | Frame type: `1` JSON, `2` binary |
| 5      | 3    | Reserved zero bytes              |
| 8      | 4    | Payload byte length              |

Limits:

| Payload                       | Maximum           |
| ----------------------------- | ----------------- |
| JSON frame                    | 8 MiB             |
| Binary frame                  | 64 MiB            |
| Binary correlation identifier | 1,024 UTF-8 bytes |

Invalid magic, nonzero reserved bytes, unknown types, oversize frames,
truncated identifiers, and invalid JSON fail the transport. Provider request
parsers may impose tighter command-specific limits.

## JSON messages

All JSON messages are UTF-8 objects with a `type`.

### `hello`

Identifies the running helper:

```json
{
  "type": "hello",
  "provider": "windows",
  "architecture": "x64",
  "buildId": "<build fingerprint>",
  "sourceDigest": "<source digest>",
  "protocol": { "major": 1, "minor": 0 },
  "features": ["..."]
}
```

The provider can be `windows` or `macos`. The Windows provider serves both
Windows Fabric and Win32 Paper; the selected endpoint is supplied to `probe`
and target commands.

### `request`

Node sends a correlated command:

```json
{
  "type": "request",
  "id": "<uuid>",
  "command": "find",
  "params": {}
}
```

Parameters are command-specific serializable data already validated by the
Node boundary. Public WebDriver element UUIDs are resolved before dispatch;
only helper-private opaque IDs cross FDR1.

The `launch` request includes `launchTimeoutMs` when explicitly configured on
the registered target. Both native providers validate its positive bounded
integer value, otherwise use their 90-second launch default, and honor the
cancellation token while discovering the application/window. Windows
application descriptors may include an existing absolute `workingDirectory`
for unpackaged process launch; packaged activation rejects that override.
These fields are trusted supervisor configuration, not WebDriver capabilities.

Element snapshots can additionally include `required` as a supported Boolean
or an unsupported value with its reason. Older or non-supporting providers may
omit it; the Node boundary treats absence as unsupported. This is additive
snapshot metadata and does not change the FDR1 framing or wire version.

Snapshots may also include `helpText` as a supported string (including an empty
string) or an unsupported value with its reason. An omitted field is unsupported
at the Node boundary. This additive metadata does not change the wire version.

Request and cancellation correlation IDs are limited to 256 UTF-8 bytes.
Helpers ignore invalid IDs before queuing work or echoing a response.

### `response`

A successful response carries `result`:

```json
{
  "type": "response",
  "id": "<request uuid>",
  "result": {}
}
```

A failed response carries a structured helper error:

```json
{
  "type": "response",
  "id": "<request uuid>",
  "error": {
    "code": "no-such-element",
    "message": "The element is no longer available.",
    "data": {}
  }
}
```

`data` is optional and bounded. It may include diagnostic operation names and
platform error codes, but not native handles or unrestricted environment data.
Node maps helper codes onto the public WebDriver error contract.

### Mutation `effect`

A failed or cancelled mutating command also reports what it did to the
application, so Node can tell a rejected mutation from one that may have
reached it. `effect` is an optional string on `response.error` and on
`cancelled`:

| `effect`  | Meaning                                                                                 |
| --------- | --------------------------------------------------------------------------------------- |
| `none`    | Nothing observable was dispatched. Idempotent focus and pointer placement do not count. |
| `partial` | Some primary mutations completed and none is still in flight or unresolved.             |
| `unknown` | A mutation was dispatched and not settled, or the helper cannot tell.                   |

The mutating commands are `activate`, `clear`, `click`, `closeWindow`,
`performActions`, `releaseActions`, `sendKeys`, and `setWindowRect`. Reads and
lifecycle commands (`launch`, `attach`, `closeApplication`, `dispose`) carry no
`effect`.

Node fails closed: an absent `effect` on a failed or cancelled mutation is
`unknown`. `none` is a rejection and leaves the target usable; `partial` and
`unknown` are indeterminate, and Node quarantines the target until it is
re-observed or restarted. A helper that dies, a failed write, and a missed
cancellation deadline never carry an `effect`, so they are also indeterminate. A
success that arrives after Node aborted the request is an applied mutation.

Providers MUST report `effect` on every failed or cancelled mutating command.
A mutation rejected before any platform call is `none`; a request cancelled while
still queued never started and is `none`. Providers must not promote an
ambiguous dispatch to `none`.

### `event`

Helpers can publish advisory application, window, structure, and transport
events:

```json
{
  "type": "event",
  "event": "window-opened",
  "sequence": 12,
  "payload": {}
}
```

Queries remain authoritative. Events can invalidate state or wake waits but do
not replace a liveness or state query.

Helpers that advertise the `windowEvents` feature also accept a `windowEvents`
command with the target `lease` and return a bounded diagnostic log of recent
window notifications and helper commands, and publish a `window-closed` event
with `{ "windowId": "..." }` when the platform reports a tracked window
destroyed. Helpers without the feature reject the command as
`unsupported-operation`; Node never requests the log unless the feature is
negotiated.

Helpers that advertise the `accessibilityActions` feature also accept an
`accessibilityActions` command with the helper-private `elementId` and return
`{ "actions": ["<name>", ...] }`: the names of the actions the platform
accessibility tree publishes for the element, in provider order. Names are
authored text only; provider handles, targets, and selectors never cross FDR1.
The command is read-only and follows the liveness rules of other element
queries. An element that publishes no actions returns an empty list. Helpers
without the feature reject the command as `unsupported-operation`, which Node
reports as `unsupported operation` rather than an empty list. The feature is
additive and does not change the wire version.

### `cancel` and `cancelled`

When a command's `AbortSignal` fires, Node sends:

```json
{ "type": "cancel", "id": "<request uuid>" }
```

The helper stops side effects, unwinds command-local work, and emits:

```json
{ "type": "cancelled", "id": "<request uuid>", "effect": "none" }
```

`effect` is the mutation effect described above and is present for mutating
commands. A queued request that is cancelled before it starts reports `none`.

Node retains the session queue and physical-input ownership until the request
settles. Failure to settle before the cancellation deadline is fatal to the
helper and triggers restricted input recovery.

## Binary messages

PNG capture data uses a binary frame. Its payload is:

| Offset | Size      | Value                              |
| ------ | --------- | ---------------------------------- |
| 0      | 4         | Correlation identifier byte length |
| 4      | N         | UTF-8 identifier                   |
| 4 + N  | remaining | Raw bytes                          |

The corresponding JSON response declares:

```json
{
  "type": "response",
  "id": "<request uuid>",
  "result": {
    "mimeType": "image/png",
    "width": 1280,
    "height": 720,
    "scaleFactor": 2
  },
  "binary": {
    "id": "<binary identifier>",
    "mimeType": "image/png",
    "width": 1280,
    "height": 720,
    "scaleFactor": 2
  }
}
```

Node completes the request only after it has both the JSON response and the
declared binary payload. An undeclared or duplicate binary identifier fails the
transport.

## Restricted helper modes

Both providers also implement:

```text
--self-test
--release-input
--release-input --sweep
```

`--self-test` runs provider-local checks without opening FDR1. Normal
`--release-input` reads a bounded JSON ledger from stdin and releases exactly
the keys/buttons mirrored by Node. `--sweep` is an operator diagnostic for a
desktop left in an uncertain state; it is not part of normal session cleanup.

The macOS provider additionally implements:

```text
--permissions
--permissions --prompt
```

These modes emit versioned unframed diagnostic JSON. Ordinary handshake,
self-test, stdio, build, and resolution paths never prompt for privacy access.

## Change rules

When changing FDR1:

1. update [protocol.json](protocol.json), Node framing/types, both native
   implementations, and this document together;
2. preserve major-version rejection and explicit feature negotiation;
3. add Node framing and provider-native self-tests;
4. verify malformed, oversize, cancellation, binary, and handshake behavior;
5. report `effect` on every failed or cancelled mutating command; the field is
   additive and does not change the wire version, but a provider that omits it
   makes every failed mutation quarantine its target;
6. update [the public protocol](../references/protocol.md) only if observable
   WebDriver semantics also change.
