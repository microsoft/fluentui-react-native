---
id: desktop-driver.operations
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Agent operations

Operations are the bounded, schema-described calls an agent makes instead of
reading the whole accessibility tree. They run inside the Desktop Driver
service, share the session's command queue with W3C commands, and return
results sized by explicit budgets. Eight exist today: the reads `observe`,
`find`, `check`, `capture`, `artifact`, and `journal`, and `act` and
`sequence`, which change the application. `@fluentui-react-native/desktop-driver-mcp`
exposes them to MCP clients as five tools. Controller lifecycle is open work in
the [implementation plan](remaining-work.md).

Operations need a provider that advertises the `boundedObservation` feature
([FDR1](../native/PROTOCOL.md#bounded-observation)): the macOS helper and the
fake host today. The Windows helper is open work. On any other provider the
catalog reports every operation but `journal` as unavailable with
`bounded-observation-unsupported`, and the driver never substitutes the
unbounded `tree`.

## Routes and envelope

| Route                                | Purpose                                    |
| ------------------------------------ | ------------------------------------------ |
| `GET /session/{id}/furn/ops`         | The catalog of operations for this session |
| `POST /session/{id}/furn/ops/{name}` | Runs one operation                         |

A request body is `{ "version"?, "requestId"?, "input"? }`. Unknown fields are
rejected, `version` must be the catalog's `schemaVersion` (1), and `input`
defaults to `{}`. A `requestId` is 1 to 64 letters, digits, or `. _ : -`; when
absent the service assigns `r1`, `r2`, and so on. Bodies are capped at 64 KiB.

A response is:

```json
{
  "schemaVersion": 1,
  "requestId": "r3",
  "operation": "observe",
  "session": { "incarnation": 1, "quarantined": true },
  "result": {}
}
```

`session.quarantined` appears only while the target refuses mutations (reads
still run). `session.incarnation` changes when the application restarts;
references never cross one.

`DesktopSessionClient` (`/client`) wraps the routes as `operations()`,
`operation(name, input, { requestId, signal })`, and one method per operation:
`observe()`, `find()`, `act()`, `check()`, `sequence()`, `capture()`,
`artifact()`, and `journal()`, each taking the same options. Aborting `signal`
abandons the HTTP call, which the service treats as the caller leaving.
`/operations` exports `executeOperation`, `describeOperations`,
`lookupOperation`, `OperationSessionState`, `maxRequestIdLength`, and the
request, response, and result types. The server builds the `OperationRuntime` in
`src/server/sessionOperations.ts`; nothing under `src/operations` imports from
`src/server`.

## The catalog

Each entry has `name`, `summary`, `effect` (`read` or `mutate`), `available`,
`unavailableReason`, and JSON Schemas for `input` and `output` generated from
the same Zod schemas the executor validates with. Output schemas do not forbid
unknown properties: a result may gain optional fields within a schema version,
so consumers ignore fields they do not know. Descriptions are written for a
model reader, and the whole catalog stays near 26 KB because MCP clients load
it into context. An operation that embeds another's input or output, as
`sequence` does, names it in the catalog instead of repeating its schema, and
validates it exactly as that operation does. An adapter may omit
`outputSchema` from `tools/list` to save more.

## observe

Reads one bounded breadth-first sample of the current window, or of the
subtree under a reference, and projects it for a model.

| Input    | Meaning                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------- |
| `view`   | `interactive` (default): what can be operated; `content`: also what is displayed; `all`: everything |
| `format` | `outline` (default): one line per element; `nodes`: the same elements as JSON objects               |
| `facts`  | Facts to show. Default `checked, enabled, expanded, focused, selected`                              |
| `within` | A reference to observe inside                                                                       |
| `budget` | Size limits, below                                                                                  |

Facts are `actions`, `checked`, `enabled`, `expanded`, `focused`, `geometry`,
`help`, `required`, `selected`, `text`, `value`, and `visible`. `value`, `text`,
and `help` carry content (see [privacy](#privacy-and-the-journal)); the
`content` view shows text and value.

Budgets are rejected, never clamped, when outside their range:

| Budget            | Default | Range          | Bounds                                    |
| ----------------- | ------- | -------------- | ----------------------------------------- |
| `maxVisited`      | 1,500   | 1 – 5,000      | Elements the application is asked to read |
| `maxDepth`        | 24      | 0 – 64         | Levels below the root                     |
| `maxStringLength` | 120     | 16 – 1,024     | Longest name, value, or text kept         |
| `deadlineMs`      | 3,000   | 50 – 15,000    | Time the application may take             |
| `maxNodes`        | 100     | 1 – 500        | Elements returned                         |
| `maxBytes`        | 12,288  | 1,024 – 65,536 | Bytes of outline or nodes returned        |

The provider's deadline is the requested one, capped to the session's native
command timeout minus 1.5 seconds, so a slow application yields a partial
sample (`complete: false`, reason `deadline`) before the command times out.

### The outline

One line per element, in document order. Indentation is the number of emitted
ancestors:

```text
<depth spaces><role> "<name>" <ref> #<automationId> <flags…> value="…" text="…" help="…" actions=A,B @x,y wxh more
```

- Everything after the reference is optional and appears in this order.
- Quoted strings are JSON string literals. Invisible, bidirectional, and
  Unicode tag characters are escaped as visible `\uXXXX`. A string cut to
  `maxStringLength` ends in `…` inside its quotes.
- `#<automationId>` is bare when it is a simple token and quoted otherwise.
- Flags are positive only: `disabled`, `?enabled` (the provider cannot say),
  `focused`, `selected`, `checked`, `unchecked` (toggle roles only), `mixed`,
  `?checked`, `expanded`, `collapsed`, `required`, `hidden`. An element with no
  remarkable state has none.
- `more` marks an element with children the sample did not return.
- `actions=` lists the actions that say what an element does. The passive ones
  that nearly every element publishes (`AXRaise`, `AXScrollToVisible`,
  `AXShowAlternateUI`, `AXShowDefaultUI`, `AXShowMenu`) are dropped, and any other
  published action makes an element interactive. A macOS scroll area therefore
  appears in the interactive view with its `AXScroll…ByPage` family listed, as in
  Calculator and Font Book. Collapsing that family is possible later.
- The `interactive` and `content` views keep the root, the elements of
  interest, and the named or structural containers above them; anonymous
  wrappers are elided. Selection takes a breadth-first prefix under
  `maxNodes` and `maxBytes`, so the top of the window is always shown before
  its depths, and the output is written in document order.

`complete` is true only when the provider finished and every element the view
selects was returned. `truncation` lists why not: `visited`, `depth`, `bytes`,
`deadline`, `unreadable`, `references`, `maxNodes`, or `maxBytes`, with counts
where known. `unsupportedFacts` lists shown facts the application cannot report
for any element, once, instead of per node. `counts` gives `visited`,
`matched`, `emitted`, and `bytes`.

## find

Searches the window, or a subtree, and says whether the match is unique. At
least one of `role`, `name`, `nameContains`, `automationId`, `text`, or
`textContains` is required, and `name` excludes `nameContains` and `text`
excludes `textContains`. `role` and the `…Contains` forms ignore case; `name`,
`automationId`, and `text` compare exactly. A node that does not report a field
fails every predicate on it, so a search cannot probe text a provider withholds,
such as a secure field's. Budgets are `maxVisited` (default and ceiling 5,000),
`maxDepth` (64), `maxStringLength` (256), `deadlineMs` (5,000), and `limit` (10
matches, at most 50).

| Outcome        | Meaning                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| `unique`       | Exactly one definite match, from a complete search                         |
| `none`         | No match, from a complete search                                           |
| `multiple`     | Two or more definite matches, even if the search was cut short             |
| `inconclusive` | Anything else; `reasons` is `incomplete`, `clipped`, or `unsupported-fact` |

A cut search can prove `multiple` but never `unique` or `none`. A `possible`
match is one whose name or text was cut so that the cut part could still decide
it. Matches are definite first, then possible, each in document order, and carry
`ref`, `role`, `name`, `automationId`, `path` (the nearest named ancestors), and
`clipped`. `more` counts candidates beyond `limit`.

## act

Changes one element. Nothing can act on an element no search proved unique, so
the element is named one of two ways: by a reference from a `find` or `check`
whose search proved it unique, citing that search's `sample` id, or by a
selector that a search run now must prove unique.

| Input    | Meaning                                                            |
| -------- | ------------------------------------------------------------------ |
| `action` | `click`, `activate`, `type`, or `clear`                            |
| `ref`    | The reference the cited search returned as its only match          |
| `sample` | That search's `sample.id`                                          |
| `find`   | A selector with `find`'s predicates, instead of `ref` and `sample` |
| `text`   | Up to 4,096 characters to type; required with `type`, only it      |

A selector that matches nothing fails with `no-match`, more than one element
with `selector-not-unique`, and a search that could not be completed with
`selector-inconclusive`; nothing is dispatched. A unique match's proof is
recorded like a `find`'s, and the result returns its `ref` and `sample` so the
element can be cited again without another search.

| Action     | Mechanism          | What the provider does                                                         |
| ---------- | ------------------ | ------------------------------------------------------------------------------ |
| `click`    | `physical-pointer` | Activates the window, hit-tests the element's centre, and clicks there         |
| `activate` | `accessibility`    | Performs the element's default accessibility action; no pointer moves          |
| `type`     | `keyboard`         | Focuses the element and synthesizes key input                                  |
| `clear`    | `provider`         | Empties the value: sets it directly when the element allows, otherwise by keys |

The result reports the `mechanism`, so physical and semantic evidence stay
distinguishable, and `disposition: "applied"`: the provider reported the action
done. Whether the application then did what the agent intended is for a later
read to establish.

Before dispatching, `act` checks, in order:

1. The target is not quarantined.
2. The provider supports the action (`click` needs `physicalClick`, `activate`
   needs `accessibilityClick`, `type` needs `keyboard`).
3. The cited sample proved a reference unique, and it is this reference. The
   service keeps the 64 most recent proofs; an application restart clears them.
4. The reference resolves, to the same provider element the proof named.

Then, inside the target's input turn, so no other input interleaves, it reads
the element again and requires its role, name, and automation id to match what
the sample showed (a clipped field matches by prefix). That fingerprint is a
precondition, not an identity: the provider's liveness check is what says the
element is still the one referenced. `click`, `activate`, and `type` need the
element enabled; `click` needs it visible and the element at its centre to be
it or inside it. A covered element fails with `obscured`, which `activate` does
not check.

Each primary step runs as a settled mutation, so a failure reports what it did
in `data.mutation`: `rejected` with effect `none` when nothing was dispatched,
or a disposition such as `indeterminate` that quarantines the target. Typed
text never enters the journal, a mutation description, or an error.

### Retrying safely

A mutating request whose caller chose the `requestId` is recorded with a digest
of its validated input. Repeating the id with the same request returns the first
outcome, success or failure, and never acts again, so a caller that lost a
response can retry. The repeat is journaled with the summary `{ "replay": true
}`. Repeating the id with a different request fails with `request-id-reused`.
The session keeps the 256 most recent outcomes; a request with no `requestId`
is never recorded. A request that fails validation or availability is not
recorded either, so it can be corrected and sent under the same id.

## check

Asks whether the application is in an expected state, and can wait up to 30
seconds for it to get there. It is a read: it never changes the application and
runs while the target is quarantined.

| Input     | Meaning                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `ref`     | An element to read; needs `expect`                                         |
| `find`    | A selector to search for; needs `expect` or `matches`                      |
| `expect`  | States, name, value, or text the element must have                         |
| `matches` | With `find`: `none`, `unique`, or `some` elements must match               |
| `waitMs`  | How long to keep checking until the expectation holds (default 0, max 30s) |

`expect` takes `checked` (`true`, `false`, or `"mixed"`), `enabled`, `expanded`,
`focused`, `selected`, `visible`, `name`, `value`, `text`, their case-insensitive
`nameContains`, `valueContains`, and `textContains` forms, and, with `ref` only,
`present`. `present: false` stands alone: it passes once the provider says the
element is gone. A field and its partial form cannot be given together. With
`find` and `expect`, the search must prove one element unique; the result
returns its `ref` and `sample`, which `act` accepts.

| Status         | Meaning                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `passed`       | Every expectation held                                                  |
| `failed`       | An expectation did not hold                                             |
| `unsupported`  | The provider does not report a state or field the check needs           |
| `inconclusive` | The search could not be completed, so absence or uniqueness is unproven |
| `timed-out`    | `waitMs` ran out; `last` is the final attempt's status                  |

Each predicate reports its own status and, when it failed, the `actual` value,
clipped to 120 characters with invisible characters made visible. A `find`
check also reports the search outcome and counts. A check never calls an
incomplete search an absence: `matches: "none"` over an unreadable subtree is
`inconclusive`.

Waiting re-evaluates on the provider's change events for the window, on a new
window, or on the application exiting, and otherwise polls from 100 ms backing
off to 1 second. Only `failed` and `inconclusive` are retried: an element the
provider says is gone stays gone, so a `ref` check that expects anything other
than its absence fails at once. The result reports `attempts` and `elapsedMs`.
Only the final search's proof is recorded, so a long wait does not evict the
proofs the caller holds.

## sequence

Runs up to eight steps in order in one call, each `{ "act": … }` or
`{ "check": … }` with that operation's input, and stops at the first act that
fails or check that does not pass. An optional `observe` input adds a closing
observation, read after the last step that ran, even when the sequence stopped.

```json
{
  "steps": [
    { "act": { "action": "activate", "find": { "name": "7", "role": "button" } } },
    { "check": { "expect": { "value": "7" }, "find": { "name": "Edit field" }, "waitMs": 2000 } }
  ],
  "observe": { "budget": { "maxNodes": 40 } }
}
```

The result's `status` is `completed` or `stopped`, with `stoppedAt` naming the
step. `steps` holds one outcome per step that ran: the act or check result, or
an `error` reduced as an operation error is, with the act's `mutation` report.
A sequence is not a transaction: steps that ran stay done, and nothing is
rolled back.

Each act takes its own input turn and releases it once its input settles, so a
check waits for the application without holding input. The checks share one
30-second wait ceiling. Before the first step, the request is refused as a
whole if the target is quarantined and a step acts, a step's action is
unsupported, or a check or the closing observation reads content the operator
denies, so such a refusal never lands halfway. A `requestId` makes the whole
sequence one recorded outcome, as for `act`. The journal keeps the step kinds
and the stopping index, never their selectors' values or typed text.

## capture and artifact

`capture` takes a PNG of the current window, or of one element when given a
`ref`, and keeps it in the session as an artifact. The result names the
artifact (`a1`, `a2`, …) and records where and when it was taken: `scope`,
`window`, `ref`, `capturedAt`, the application `incarnation`, and the preview
`previewGeneration`, with `width` and `height` in pixels, `scaleFactor`,
`bytes`, and `sha256`. Pixels come back only when the caller asks with
`image: true`, as base64, and only when the image is at most 1 MiB; a larger
one reports `imageOmitted: "too-large"`.

`artifact` reads a kept image in base64 pages of up to 1 MiB (`length`,
default 1 MiB), from `offset`, with `next` naming the following page until the
end. The session keeps its 16 most recent captures and at most 32 MiB of them,
dropping the oldest first, and an id is never reused: a dropped id fails with
`artifact-expired`, one never issued with `artifact-unknown`. A capture larger
than 16 MiB is refused with `capture-too-large`; capture an element instead.

Both need the provider's window capture (`capture-unsupported` otherwise), and
element capture needs element capture (`element-capture-unsupported`). Pixels
show whatever the application displays, so both fail with `content-denied`
under a `deny` policy. The journal keeps the scope, artifact id, size, and
dimensions, never pixels or the hash.

## References and provider records

A reference is an opaque `<tag><serial>` string. The tag is random per session
and per incarnation and never reused in the process, so a reference from
another session or server cannot resolve here. Each element keeps one
reference while the table retains it, so repeated observations report unchanged
elements under unchanged references. A reference pins its window and keeps
working while another window is current. The table holds at most 2,000
references per session. Beyond that it drops references into a replaced preview
region first, then the least recently returned; the references an observation
just returned are never dropped by that observation.

A reference that does not resolve fails with a reason:

| Reason                    | Error code                | Meaning                                                          |
| ------------------------- | ------------------------- | ---------------------------------------------------------------- |
| `ref-malformed`           | `invalid argument`        | Not a reference                                                  |
| `ref-unknown`             | `no such element`         | Never issued in this session                                     |
| `ref-foreign`             | `no such element`         | Issued by another session or server                              |
| `ref-expired`             | `stale element reference` | Issued here, since dropped                                       |
| `ref-earlier-incarnation` | `stale element reference` | Belongs to an earlier incarnation of the application             |
| `ref-region-changed`      | `stale element reference` | Into a preview region that has been replaced                     |
| `ref-stale`               | `stale element reference` | The provider no longer has the element; the reference is dropped |

Observation creates a provider record for every element it reads, so the
operation layer keeps provider memory proportional to what the session holds:

- Only returned elements get references. Every other record the sample created
  is released through `releaseElements` in batches of at most 1,000, on a
  command that still runs when the caller has left.
- A failed release keeps the ids pending, adds a `release-failed` warning, and
  retries on the next operation; it never fails the operation.
- Ids issued to W3C clients (`findElement`) are external: observation never
  releases them, and they stay until the window or application closes.
- A reference the provider proves gone, and every reference into a window the
  provider reports closed, is dropped and its record queued for release.
- Records created by an observation that never returned, such as one the
  caller abandoned, cannot be released because Node never learned their ids.
  They stay until `closeWindow` or `closeApplication` drops them.

## Errors

Every failure is a W3C WebDriver error whose `data` names the `operation`,
`requestId`, and `schemaVersion`, so it correlates with the journal. `message`
is bounded to 300 characters with invisible characters made visible, and
`stacktrace` is empty. Callers branch on `data.reason`, never the message.
Provider data is reduced to an allowlist: `reason`, `nativeCode`, and a
rebuilt `mutation` report.

| Reason                            | Error code                  | Meaning                                                 |
| --------------------------------- | --------------------------- | ------------------------------------------------------- |
| `invalid-envelope`                | `invalid argument`          | Not a JSON object, or an unknown request field          |
| `invalid-request-id`              | `invalid argument`          | `requestId` is malformed                                |
| `unsupported-version`             | `invalid argument`          | `version` is not the catalog's                          |
| `invalid-input`                   | `invalid argument`          | Input failed validation; names the field, not the value |
| `unknown-operation`               | `unknown command`           | No such operation                                       |
| `bounded-observation-unsupported` | `unsupported operation`     | The provider cannot observe                             |
| `content-denied`                  | `unsupported operation`     | The operator denied reading displayed content           |
| `no-window`, `window-closed`      | `no such window`            | There is no window to read, or it closed                |
| `target-non-response`             | `unknown error`             | The application did not answer in time; retry later     |
| `ref-…`                           | see above                   | A reference did not resolve                             |
| `cancelled`                       | `unknown error`             | The caller left, or the command was cancelled           |
| `request-id-reused`               | `invalid argument`          | The `requestId` already named a different request       |
| `action-unsupported`              | `unsupported operation`     | The provider cannot perform this action                 |
| `sample-not-unique`               | `invalid argument`          | The sample proved nothing unique, or it was forgotten   |
| `ref-not-proven`                  | `invalid argument`          | The sample proved a different reference unique          |
| `no-match`                        | `no such element`           | `act`'s selector matched nothing                        |
| `selector-not-unique`             | `invalid argument`          | `act`'s selector matched more than one element          |
| `selector-inconclusive`           | `invalid argument`          | `act`'s search could not be completed                   |
| `fingerprint-changed`             | `stale element reference`   | The element's role, name, or automation id changed      |
| `not-enabled`, `not-visible`      | `element not interactable`  | The element cannot take the action                      |
| `obscured`                        | `element click intercepted` | Something else is at the element's centre               |
| `target-quarantined`              | `unknown error`             | An earlier change may still land; reads still work      |
| `capture-unsupported`             | `unsupported operation`     | The provider cannot capture a window                    |
| `element-capture-unsupported`     | `unsupported operation`     | The provider cannot capture one element                 |
| `capture-too-large`               | `unsupported operation`     | The image is larger than 16 MiB                         |
| `artifact-expired`                | `invalid argument`          | The capture was dropped to make room for newer ones     |
| `artifact-unknown`                | `invalid argument`          | No capture in this session has that id                  |
| `offset-out-of-range`             | `invalid argument`          | `artifact`'s offset is past the end of the image        |

A provider's own failure carries its `nativeCode` and, for a command that may
have changed the application, the settled `mutation` disposition.

## Privacy and the journal

Element names and automation ids identify controls and are always readable.
What an application displays (`value`, `text`, `help`) is content. The operator
chooses the policy when constructing the server:

```ts
createDesktopDriverServer({ targets, operations: { content: 'deny' } });
```

The default is `allow`. Under `deny`, a request for content facts, the
`content` view, a `text` or `textContains` predicate, or a `check` expecting a
value or text, and `capture` or `artifact`, fails with `content-denied`; names
and states stay available. A request cannot change the policy.

The policy cannot see inside identifiers. An application that puts what it
displays into a name or automation id still shows it under `deny`: Calculator's
input field has the automation id `StandardInputView;value:113,463`, where the
value is what the field displays.

Each session keeps a bounded journal of 500 entries: operation, request id,
outcome, effect, timing, an error code and reason, and scalar summary fields the
operation declared safe (for `find` and `check`, the names of the predicates
and expectations, never their values). Typed text, expected text, displayed
content, and error messages never enter it. The
`journal` operation reads it in pages (default 50, at most 200) with `after` and
`next` cursors and reports `dropped` entries; it is not itself journaled.

## Queueing, cancellation, and quarantine

Operations run on the session's command queue, so they serialize with W3C
commands and the queue advances only after a command settles. A caller that
disconnects aborts its host commands; the journal records the call as
`cancelled`. The reads still run while the target is quarantined and report it
in `session.quarantined`. `act` is refused with `target-quarantined` in fixed
words: the service's own quarantine message quotes the command and provider
text, which an agent might read as instructions, so operations keep only the
machine-readable report.

A dispatched action runs to settlement even when its caller leaves; only the
session ending or the native command timeout stops it, and an unconfirmed stop
quarantines the target. A caller that leaves before dispatch gets `cancelled`
with nothing done.

## Testing

`src/operations/*.test.ts` covers each module against a stub runtime, and
`src/server/operations.test.ts` drives the routes over HTTP against the fake
host. Enable observation on the fake with
`features: { boundedObservation: true, accessibilityActions: true }`, build large
trees with `createFakeTree` in `src/testing/fakeTree.ts`, and script slow reads,
record limits, or unreadable subtrees with the fake host's `observation`
option. Pass server options, such as the content policy, as the harness's third
argument. Parse real results against the published schemas with
`z.fromJSONSchema(entry.output)`.

## Limitations

- Observation depends on the provider. The Windows provider and trees near the
  5,000-element limit are not yet qualified. On macOS, a stopped application
  fails a read after about 1.5 seconds with the reason `target-non-response`, and
  the helper's memory stayed flat across thousands of reads; both were measured
  against Calculator and Font Book only
  ([details](../native/macos/README.md#bounded-observation)).
- Names come from the application. Font Book exposes three window-control
  buttons with no name, so an agent finds them by role and position.
- A provider repeats `{ "supported": false }` for every node when an
  application cannot report a fact. The projection names such facts once in
  `unsupportedFacts`, so that cost stays on the helper pipe and does not reach
  the agent.
- The first read of a freshly launched application can see fewer elements than
  the second, because applications create some elements lazily.
- Persisting the journal, recording, and replay are follow-on work.
