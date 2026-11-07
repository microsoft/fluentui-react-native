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

`data.reason`, when a provider sets it, is a short lowercase token a caller can
branch on instead of parsing `message`. A provider sets `target-non-response` on
`automation-failed` when the target application did not answer an accessibility
request in time, such as a hung, busy, or exiting application: the request was
well formed, a read leaves nothing to settle, and a retry can succeed once the
application answers. A provider that cannot tell the cause omits `reason`.

### Mutation settlement

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
`performAccessibilityAction`, `performActions`, `releaseActions`, `sendKeys`,
and `setWindowRect`. Reads and
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

A provider that bounds its own application calls can also settle for itself.
Two additive codes carry their own effect, so a bare timeout is never reported as
a rejection:

| Code                     | Effect    | Meaning                                                                                                       |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------- |
| `mutation-indeterminate` | `unknown` | A mutation did not settle before the provider's deadline and may still land. The provider quarantines itself. |
| `target-quarantined`     | `none`    | The provider refused a mutation because an earlier one is unsettled. Nothing reached the application.         |

While a provider is quarantined, observation, input release, close, and
`dispose` remain available so the application can be re-observed. A provider
that records its quarantine per application lease may end the records of a
launched application when `closeApplication` verifies that the process exited,
because nothing that application left in flight can land afterwards, as Node does
for its own quarantine. It must never end the records of an attached
application, which keeps running, nor of a mutation it could not attribute to a
lease. Node reports both codes as `unknown error` with the helper code in
`data.nativeCode`, and mirrors a provider's quarantine so the service refuses
mutations for that target as well. A caller must never replay an indeterminate
mutation. A provider that
cannot establish settlement must fail closed this way rather than advance its
queue. A mutation whose provider call times out after the request reached the
provider is such a case; an explicit provider rejection and any failed read
remain ordinary errors. The codes and `effect` do not change the wire version.

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
with `{ "windowId": "..." }` once when the platform reports a tracked window
destroyed. A window closed through `closeWindow` publishes no event for that
id. The log fields are provider diagnostics described in each provider README.
A log's `eventsTruncated` is true when older events were evicted from its
bounded history or omitted by the requested tail limit; it is false when the
returned events include the full retained history for that application.
A provider whose platform notifications cannot be registered says so in the log
and keeps answering from liveness queries, which stay authoritative. Helpers
without the feature reject the command as `unsupported-operation`; Node never
requests the log unless the feature is negotiated.

Helpers that advertise the `accessibilityActions` feature also accept an
`accessibilityActions` command with the helper-private `elementId` and return
`{ "actions": ["<name>", ...] }`: the names of the actions the platform
accessibility tree publishes for the element, in provider order. Names are
authored text only; provider handles, targets, and selectors never cross FDR1.
The command is read-only and follows the liveness rules of other element
queries. An element that publishes no actions returns an empty list, and so
does an element whose platform query answers that it has no action list (for
example a native split divider whose action query reports a general failure);
only failures that mean the connection or the element itself is broken are
`automation-failed` or `stale-element`. The `actions` fact of `observe` follows
the same rule, so one element without an action list never drops that element
from a sample. Helpers without the feature reject the command as
`unsupported-operation`, which Node reports as `unsupported operation` rather
than an empty list. The feature is additive and does not change the wire
version.

Helpers that also advertise `performAccessibilityAction` add a `keys` array to
the `accessibilityActions` response, one opaque string of 1 to 128 characters
per entry of `actions`, in the same order. A key names the exact platform
action the helper listed, not its display name: two actions with the same name
have different keys. Keys are stable for the life of the helper process, must
not reveal the platform identity they stand for (the macOS helper uses an HMAC
under a per-process secret), and mean nothing to another helper. The mutating
`performAccessibilityAction` command takes `{ "elementId": "<id>", "key":
"<key>" }`, re-reads the live element's actions, and performs the one action
whose key matches. If no action or more than one action matches, it fails
`element-not-interactable` with `data.reason` `action-changed` and effect
`none`; a broken element is `stale-element`. Node lists and performs inside
one input turn and refuses a display name the element does not publish
exactly once, so a key never reaches a different action than the one the
agent named.

### Clear mechanisms

The mutating `clear` command takes `{ "elementId": "<id>" }`. Helpers that
advertise `strictClear` in `hello.features` and in the `features` map of the
`probe` result also accept an optional `mechanism` of `"semantic"` or
`"keyboard"`, and answer every successful clear with
`{ "mechanism": "semantic" | "keyboard" }`, naming the mechanism that cleared
the element:

- Without `mechanism`, the helper writes an empty value through the platform
  accessibility value (macOS `AXValue`, the Windows UI Automation Value
  pattern) and, when the element has no writable value or the write is
  refused, falls back to focusing the element and pressing select-all and
  Delete.
- `semantic` uses only the value write and never falls back to the keyboard.
  An element without a writable value fails `element-not-interactable` with
  effect `none` before anything is dispatched, and a broken element is
  `stale-element`. A write that was dispatched and failed settles as any other
  mutation does: a refusal that proves the write never acted is `none`, any
  other failure is `unknown`, and a write that never settles is
  `mutation-indeterminate`.
- `keyboard` skips the value write and clears only with the keyboard, behind
  the same input authority, session, focus, and physical input lock checks as
  the fallback. A check that refuses, such as `input-unavailable`, dispatches
  nothing and is `none`.

Any other `mechanism`, including one that is not a string, fails
`invalid-params` with effect `none`. Node never sends `mechanism` unless the
feature is negotiated, and treats a result without a recognized `mechanism`,
such as the `null` an older helper returns, as not saying which mechanism
cleared. The parameter, result, and feature are additive and do not change the
wire version.

### Bounded observation

Helpers that advertise `boundedObservation` in `hello.features` and in the
`features` map of the `probe` result accept the `observe` and `releaseElements`
commands. Both are read-only: they never report an `effect` and never
quarantine a target. Helpers without the feature reject them as
`unsupported-operation`. Node never sends them unless the feature is negotiated
and never substitutes the unbounded `tree` or `find` for a bounded request.
The feature is additive and does not change the wire version.

The helper bounds the traversal and reports raw facts; Node owns projection
policy (interactive filtering, ancestor outlines, page sizes, deltas), so the
agent-facing result is identical on every provider. `tree`, `find`, and
`source` keep their existing unbounded behavior.

#### `observe`

Reads one bounded, ordered sample of a window's accessibility tree:

```json
{
  "windowId": "<helper window id>",
  "rootId": "<optional element id that roots the sample>",
  "budget": {
    "maxVisited": 1000,
    "maxDepth": 12,
    "maxStringLength": 256,
    "maxBytes": 262144,
    "deadlineMs": 2000
  },
  "facts": ["enabled", "focused", "actions"]
}
```

All `budget` fields are required integers. A helper rejects an out-of-range
value as `invalid-params` and never clamps it silently; it also rejects unknown
fields and unknown or repeated `facts`.

| Budget            | Range          | Bounds                                                                             |
| ----------------- | -------------- | ---------------------------------------------------------------------------------- |
| `maxVisited`      | 1 to 5,000     | Nodes the helper may read, which are the nodes it emits.                           |
| `maxDepth`        | 0 to 64        | Distance from the root; the root is depth 0.                                       |
| `maxStringLength` | 16 to 1,024    | UTF-16 code units kept per string; longer strings are cut and the field is listed. |
| `maxBytes`        | 4,096 to 4 MiB | Approximate UTF-8 size of the emitted nodes.                                       |
| `deadlineMs`      | 50 to 30,000   | Elapsed time after which the helper starts no further provider call.               |

`rootId` is an element id the helper already tracks in that window; an
untracked or foreign root is `stale-element` and an unknown window is
`no-such-window`. Without a root the sample starts at the window.

The helper walks **breadth first** from the root, children in provider order,
and emits the root first; the root is always read, whatever the budgets. An
element reachable twice is emitted once, under the first parent that reached it
in breadth-first order; later parents neither emit it nor count it in their
`childCount`. A child that turns out stale when the helper reads it is dropped
from its parent's `childCount`, so a parent whose children all vanished becomes
`none`. A child that cannot be read for any other reason is skipped, counts
toward its parent's `childCount`, leaves that parent `truncated`, and adds the
`unreadable` truncation. Work is
incremental: the helper reads a node's children only when the budget still
allows visiting them, and never prefetches a whole subtree before applying a
limit. The result is deterministic for an unchanged tree.

Every node always carries `id`, `depth`, `role`, `scope`, and `childrenState`,
and carries `parentId` (absent only on the root), `name`, `automationId`, and
`childCount` when known. Everything else appears only when named in `facts`,
so a field's absence means **unobserved**. The exception is `value` and `text`,
which are plain strings: when they are requested, a node without one omits the
field because the element has none. A requested fact that a node cannot
report keeps the supported or unsupported value shape of snapshots
(`{ "supported": false, "reason": "..." }`), so unobserved, unsupported, and
observed stay distinguishable:

| `facts` entry                                                                  | Adds to the node                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `checked`, `enabled`, `expanded`, `focused`, `required`, `selected`, `visible` | The field of that name, as a supported or unsupported value as in snapshots. |
| `actions`                                                                      | `actions`: the names `accessibilityActions` returns, possibly empty.         |
| `geometry`                                                                     | `rect`, relative to the window's origin as in snapshots.                     |
| `value`, `text`                                                                | `value` or `text`, derived as in snapshots.                                  |
| `help`                                                                         | `helpText`, as a supported or unsupported value.                             |

`role`, `name`, `automationId`, `scope`, and the facts use the same derivation
and vocabularies as element snapshots; `scope` includes the preview-region
detection `tree` performs, and a node under a preview root keeps that scope
when a later sample is rooted below it. A provider never reports `value` or
`text` for a password or secure field. When the platform cannot report a
requested fact for any element, the provider lists the fact once in
`unsupportedFacts` and omits it from every node instead of repeating a reason
per node. The list is a provider capability, not a statistic of the sample: it
holds only requested facts, a fact that some elements report and others cannot
is never listed and keeps its per-node unsupported value, and a provider that
can report every fact returns an empty list. A string cut to
`maxStringLength` is listed in that node's `clipped` array, for example
`["name"]`. A cut never separates the two halves of a surrogate pair, so a
clipped string may be one unit shorter than the limit; that keeps every emitted
string encodable.

`childrenState` states what the sample knows about a node's children:

| Value       | Meaning                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| `none`      | The helper read the children and the node has none.                                |
| `complete`  | Every child was emitted.                                                           |
| `truncated` | The node has children that were not emitted; `childCount` is the total when known. |
| `unknown`   | The helper did not read the children, so the node must not be reported as a leaf.  |

The response:

```json
{
  "nodes": [{ "id": "e1", "depth": 0, "role": "window", "scope": "application", "childrenState": "complete" }],
  "complete": false,
  "truncation": [{ "reason": "visited", "limit": 1000, "unvisited": 85 }],
  "elapsedMs": 83,
  "unsupportedFacts": ["required"]
}
```

`nodes` are in emission order and every `parentId` names an earlier node.
`complete` is true only when no limit stopped the walk, so a depth-limited or
truncated sample never establishes absence, an exact count, or uniqueness.
Each `truncation` entry has a `reason` that appears at most once: `visited`,
`depth`, `bytes`, `deadline`, `references` (the helper's element table is at
capacity), or `unreadable` (a provider read of an element or of its children
failed other than as a stale element). `limit` repeats the budget that applied
and `unvisited` is a lower bound on elements known to exist but not visited. An
element that disappears during the walk is skipped; a changing tree yields a
best-effort sample, so Node brackets each call with its own capture interval.

An element's `id` is the id every element command uses. One underlying element
keeps one id while the helper retains its record, so a repeated sample reports
unchanged elements under unchanged ids. The helper never reuses an id after the
record is released or forgotten. At capacity the helper stops emitting with
the `references` reason instead of evicting or recycling a record; when the
table has no room even for the root, `nodes` is empty and `references` is the
only reason that may accompany an empty sample. To see more of a `truncated`
node, Node sends a new `observe` rooted at its id; that is a new sample, not a
continuation of the previous one.

`observe` fails as `invalid-params`, `no-such-window`, `stale-element`, or
`automation-failed`, and with the same permission failure `tree` reports when
accessibility access is missing. A cancelled `observe` ends as `cancelled`
without an `effect`; records it already created stay until released.

#### `releaseElements`

Drops the helper's records for ids Node no longer needs:

```json
{ "ids": ["e12", "e13"] }
```

The result is `{ "released": 2 }`, the number of records actually dropped. At
most 1,000 ids of at most 256 UTF-8 bytes each may be sent. An id the helper
does not track is ignored, so the command is idempotent. A released id behaves
like any untracked id: element commands reject it as `stale-element`. Node
releases only ids it created for agent observation and never an id it has
issued to a WebDriver client.

A provider also drops a window's records when it forgets the window: at
`closeWindow` and `closeApplication`, and every record at `dispose`. That covers
ids Node never learned, such as those an abandoned `observe` recorded before it
could answer, and ids issued to WebDriver clients, which Node never releases.

#### Conformance

Both providers must pass the same cases before Node enables the feature for
them: a tree larger than every budget returns a partial sample instead of
`tree-too-large`; each truncation reason can be provoked on its own; two
samples of an unchanged tree report identical ids and order; a duplicate
reachable element is emitted once; a released id is rejected and never
reappears; capacity stops emission with `references`; an element or child list
that cannot be read is skipped or left `unknown` with the `unreadable` reason
instead of failing the sample; a hung provider read ends at the deadline plus
the one in-flight call; cancellation unwinds without an `effect`; and no
response exceeds `maxBytes` by more than one node.

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
--service-identity
--application-incarnation
```

The permission modes emit versioned unframed diagnostic JSON. Ordinary
handshake, self-test, stdio, build, and resolution paths never prompt for
privacy access. `--service-identity` follows the one-shot contract below; see
[the macOS service verifier](../references/security.md#macos-service-verifier).
`--application-incarnation` also follows it: the request is exactly
`{"pid":<positive 31-bit integer>,"startedAt":"<ISO 8601 time>"}`, and the
answer is `{"ok":true,"state":"running"|"exited"|"unknown"}`. `running` means
the process id names a process whose start time is within 10 ms of `startedAt`;
`exited` means the process id is free or a zombie, or names a process that
started more than one second later; anything else, including a process the
kernel will not show this user, is `unknown`. See
[settlement journal and recovery](../references/security.md#settlement-journal-and-recovery).

The Windows provider additionally implements:

```text
--private-storage
--service-identity
--application-incarnation
```

The Windows `--application-incarnation` takes the same request and gives the
same answer. `exited` means the process id names no process, the process holding
it has exited, or it names a process created more than one second later;
`running` means a live process created within 10 ms of `startedAt`; anything
else, including a process this account cannot open, is `unknown`. The request's
`startedAt` must be exactly `YYYY-MM-DDTHH:MM:SS`, an optional fraction of 1 to
9 digits, and `Z` or a `+HH:MM`/`-HH:MM` offset.

These and the macOS `--service-identity` and `--application-incarnation` are one-shot modes, not FDR1
sessions. Each reads one JSON request from
standard input (at most 128 KiB, a leading UTF-8 byte order mark ignored),
writes one JSON line to standard output, and exits 0 exactly when the line has
`"ok":true`. A completed `--service-identity` verification that finds a
mismatch is still `"ok":true` with `"verified":false`. A missing, empty,
oversize, or malformed request answers `{"ok":false,"reason":"request"}`.
Record contents travel as canonical base64 in the request, never on a command
line, and a failure carries only a fixed `reason`, an optional `detail`, and an
optional Windows `win32` code, never a path or a record's contents. The Node adapters in
`src/authority` own the request and response shapes; see
[the Windows private storage and service verifier](../references/security.md#windows-private-storage-and-service-verifier).

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
