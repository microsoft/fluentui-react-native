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
results sized by explicit budgets. Three exist today, all reads: `observe`,
`find`, and `journal`. Actions, waits, checks, capture, controller lifecycle,
and the MCP adapter that will expose these operations are open work in the
[implementation plan](remaining-work.md).

Operations need a provider that advertises the `boundedObservation` feature
([FDR1](../native/PROTOCOL.md#bounded-observation)): the macOS helper and the
fake host today. The Windows helper is open work. On any other provider the
catalog reports `observe` and `find` as unavailable with
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
`operation(name, input, { requestId })`, `observe()`, `find()`, and
`journal()`. `/operations` exports `executeOperation`, `describeOperations`,
`lookupOperation`, `OperationSessionState`, and the request, response, and
result types. The server builds the `OperationRuntime` in
`src/server/sessionOperations.ts`; nothing under `src/operations` imports from
`src/server`.

## The catalog

Each entry has `name`, `summary`, `effect` (`read` or `mutate`), `available`,
`unavailableReason`, and JSON Schemas for `input` and `output` generated from
the same Zod schemas the executor validates with. Output schemas do not forbid
unknown properties: a result may gain optional fields within a schema version,
so consumers ignore fields they do not know. Descriptions are written for a
model reader, and the whole catalog stays near 13 KB because MCP clients load
it into context. An adapter may omit `outputSchema` from `tools/list` to save
more.

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

| Reason                            | Error code              | Meaning                                                 |
| --------------------------------- | ----------------------- | ------------------------------------------------------- |
| `invalid-envelope`                | `invalid argument`      | Not a JSON object, or an unknown request field          |
| `invalid-request-id`              | `invalid argument`      | `requestId` is malformed                                |
| `unsupported-version`             | `invalid argument`      | `version` is not the catalog's                          |
| `invalid-input`                   | `invalid argument`      | Input failed validation; names the field, not the value |
| `unknown-operation`               | `unknown command`       | No such operation                                       |
| `bounded-observation-unsupported` | `unsupported operation` | The provider cannot observe                             |
| `content-denied`                  | `unsupported operation` | The operator denied reading displayed content           |
| `no-window`, `window-closed`      | `no such window`        | There is no window to read, or it closed                |
| `ref-…`                           | see above               | A reference did not resolve                             |
| `cancelled`                       | `unknown error`         | The caller left, or the command was cancelled           |

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
`content` view, or a `text` or `textContains` predicate fails with
`content-denied`; names and states stay available. A request cannot change the
policy.

Each session keeps a bounded journal of 500 entries: operation, request id,
outcome, effect, timing, an error code and reason, and scalar summary fields the
operation declared safe (for `find`, the names of the predicates, never their
values). Typed text, displayed content, and error messages never enter it. The
`journal` operation reads it in pages (default 50, at most 200) with `after` and
`next` cursors and reports `dropped` entries; it is not itself journaled.

## Queueing, cancellation, and quarantine

Operations run on the session's command queue, so they serialize with W3C
commands and the queue advances only after a command settles. A caller that
disconnects aborts its host commands; the journal records the call as
`cancelled`. All three operations are reads, so they still run while the target
is quarantined and report it in `session.quarantined`.

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

- Observation depends on the provider. The Windows provider, real hung
  applications, trees near the 5,000-element limit, and retained memory across
  long sessions are not yet qualified.
- A provider repeats `{ "supported": false }` for every node when an
  application cannot report a fact. The projection names such facts once in
  `unsupportedFacts`, so that cost stays on the helper pipe and does not reach
  the agent.
- The first read of a freshly launched application can see fewer elements than
  the second, because applications create some elements lazily.
- Persisting the journal, recording, and replay are follow-on work.
