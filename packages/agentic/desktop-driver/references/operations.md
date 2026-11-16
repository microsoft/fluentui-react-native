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
results sized by explicit budgets. Twelve exist today: the reads `observe`,
`observeDelta`, `observePage`, `find`, `check`, `capture`, `artifact`,
`stories`, and `journal`, and `act`, `sequence`, and `story`, which change the
application.
`@fluentui-react-native/desktop-driver-mcp` exposes them to MCP clients as six
tools. Controller lifecycle is open work in
the [implementation plan](remaining-work.md).

Operations need a provider that advertises the `boundedObservation` feature
([FDR1](../native/PROTOCOL.md#bounded-observation)): both native helpers and the
fake host. On any other provider the
catalog reports every operation but `journal`, `stories`, and `story` as
unavailable with `bounded-observation-unsupported`, and the driver never
substitutes the unbounded `tree`. The story operations need a story
orchestrator instead.

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
still run). `session.incarnation` is a session-local reference generation, not
automatic application-restart detection or a service identity. Reopen after an
application replacement; references never cross sessions.

`DesktopSessionClient` (`/client`) wraps the routes as `operations()`,
`operation(name, input, { requestId, signal })`, and one method per operation:
`observe()`, `observeDelta()`, `observePage()`, `find()`, `act()`, `check()`,
`sequence()`, `capture()`, `artifact()`, `stories()`, `story()`, and
`journal()`, each taking the same options. Aborting `signal`
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
model reader, and the whole catalog stays near 29 KB because MCP clients load
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
| `maxNodes`        | 100     | 1 – 500        | Elements returned on this page            |
| `maxBytes`        | 12,288  | 1,024 – 65,536 | Bytes of outline or nodes on this page    |

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
- `more` marks children not returned on this page or by the provider. Page
  results repeat the ancestors needed to place their elements in context.
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
selects has been returned across the pages. If `next` is present, pass it to
`observePage` to read the next page from the same immutable sample without
calling the provider again. A continuation can expire when its bounded cache
entry is evicted or its application/preview epoch changes; then take a fresh
observation. If ancestor context does not fit the requested page budget, retry
that cursor with a larger `maxNodes` or `maxBytes`.

The session retains at most two immutable samples, 8 MiB, and 8,000 native
element ids for page and delta reads. Cached ids stay pinned until eviction so
the provider cannot release an element still named by a cursor. When a sample
cannot be retained, `continuationUnavailable: "cache-limit"` is explicit.
`truncation` lists provider and page limits: `visited`, `depth`, `bytes`,
`deadline`, `unreadable`, `references`, `maxNodes`, or `maxBytes`, with counts
where known. `unsupportedFacts` lists shown facts the application cannot report
for any element, once, instead of per node. `counts` gives `visited`,
`matched`, `emitted`, and `bytes` for this page.

## observeDelta and observePage

`observeDelta` takes a fresh sample and compares it with a retained base named
by `since`. The base and fresh sample must match in application and preview
epoch, window or element scope, view, shown facts, format, and native walk
limits. Page-size limits may differ. A missing or mismatched base returns
`mode: "fresh"` with a new snapshot and a reset reason; it never presents a
new sample as a continuation of an old one.

A matching base returns `mode: "delta"` with added, changed, and removed
projected elements. Removals are reported only when both provider samples and
their projections are complete. Otherwise `removalsSuppressed` is true, so an
omitted or truncated node is never called deleted. `truncation` says why a basis was incomplete: the provider's own
cuts, or the 5,000-element budget a delta compares within. A delta names a
changed or added element by a reference it issues, and only for the changes it
returns, so a delta of nothing issues none. A removed element is gone, so it
keeps the reference the session already holds and has none otherwise; it never
spends table capacity or evicts a reference the caller holds. Delta pages carry `next`;
pass it to `observePage`, which reads the retained base and fresh sample without
sampling again. Page cursors are opaque, session-bound, and fail explicitly
when their bases are evicted.

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
`clipped`. `more` counts candidates beyond `limit`; when it is present,
`complete` is false and `truncation` lists a `limit` entry, so a result that left
matches out never reads as whole.

`complete` means the same on every result that can leave things out (`observe`,
`observeDelta`, `find`, `journal`, and `stories`): nothing reachable was left out
by a provider cut, a size limit, or a page. Text cut short does not clear it; it
is marked on the item instead, as `clipped` on a `find` match or a story entry.

## act

Changes one element. Nothing can act on an element no search proved unique, so
the element is named one of two ways: by a reference from a `find` or `check`
whose search proved it unique, citing that search's `sample` id, or by a
selector that a search run now must prove unique.

| Input    | Meaning                                                            |
| -------- | ------------------------------------------------------------------ |
| `action` | `click`, `activate`, `perform`, `type`, or `clear`                 |
| `ref`    | The reference the cited search returned as its only match          |
| `sample` | That search's `sample.id`                                          |
| `find`   | A selector with `find`'s predicates, instead of `ref` and `sample` |
| `text`   | Up to 4,096 characters to type; required with `type`, only it      |
| `name`   | An action name `observe` listed; required with `perform`, only it  |

A selector that matches nothing fails with `no-match`, more than one element
with `selector-not-unique`, and a search that could not be completed with
`selector-inconclusive`; nothing is dispatched. A unique match's proof is
recorded like a `find`'s, and the result returns its `ref` and `sample` so the
element can be cited again without another search.

| Action     | Mechanism          | What the provider does                                                         |
| ---------- | ------------------ | ------------------------------------------------------------------------------ |
| `click`    | `physical-pointer` | Activates the window, hit-tests the element's centre, and clicks there         |
| `activate` | `accessibility`    | Performs the element's default accessibility action; no pointer moves          |
| `perform`  | `accessibility`    | Performs the accessibility action the element publishes as `name`              |
| `type`     | `keyboard`         | Focuses the element and synthesizes key input                                  |
| `clear`    | `provider`         | Empties the value: sets it directly when the element allows, otherwise by keys |

The result reports the `mechanism`, so physical and semantic evidence stay
distinguishable, and `disposition: "applied"`: the provider reported the action
done. Whether the application then did what the agent intended is for a later
read to establish.

Before dispatching, `act` checks, in order:

1. The target is not quarantined.
2. The provider supports the action (`click` needs `physicalClick`, `activate`
   needs `accessibilityClick`, `perform` needs `accessibilityActions` and
   `performAccessibilityAction`, `type` needs `keyboard`).
3. The cited sample proved a reference unique, and it is this reference. The
   service keeps the 64 most recent proofs; an application restart clears them.
4. The reference resolves, to the same provider element the proof named.

Then, inside the target's input turn, so no other input interleaves, it reads
the element again and requires its role, name, and automation id to match what
the sample showed (a clipped field matches by prefix). That fingerprint is a
precondition, not an identity: the provider's liveness check is what says the
element is still the one referenced. Every action but `clear` needs the element enabled, and `click`
needs it visible and the element at its centre to be it or inside it. A state
the provider cannot report is not false: it fails with `state-unsupported`, and
a reported `false` with `not-enabled` or `not-visible`. Both name the reference
the selector or the sample proved. A covered element fails with `obscured`,
which `activate` does not check.

A `click` hit-tests before it raises the window. A point covered by something in
the element's own window fails with `obscured` and nothing dispatched, because
raising the window cannot uncover it. Otherwise the window is activated, the
point is tested again, and the pointer clicks. If activation succeeded and the
second test fails, finds the point still covered, or the click itself reports
nothing applied, the failure carries effect `partial` and disposition
`indeterminate`: the window was raised even though no click landed. A hit test
that times out or is cancelled is reported as that, never as `obscured`.

A provider's own failure while acting is reported in fixed words for its error
code, keeping only the machine `reason` and `nativeCode` and the settled
mutation. Provider messages quote window titles and element ids, so they are not
passed on. A provider that no longer has the element or window drops the
reference, as it does for a read.

An unsupported native activation keeps its `nativeCode` and any reported
machine `reason`. A rejection with effect `none` records no input delivery and
does not quarantine the target. `activate` never retries with physical input;
after such a rejection, a caller may explicitly choose `click` if the session
permits it. An indeterminate outcome is not permission to replay the action.

A session's `furn:inputMode` ([protocol](protocol.md#sessions-and-targets)) limits the
mechanisms `act` may use. In an `accessible` session the runtime reports no
`physicalClick` or `keyboard`, so `click` and `type` fail with
`action-unsupported`. A strict session (`accessible` or `physical`) also needs
`clear` to use one mechanism, semantic or keyboard respectively. The service
always reports its `clear` capability from the session's mode and the target's
features: it is false when the mode forbids that mechanism or the target cannot
clear with only that mechanism, and never left permissive by omission. Then
`clear` fails with `action-unsupported` before anything is dispatched, and
`sequence` refuses the whole request up front. A mechanism the policy forbids or
the host does not deliver fails with `input-policy` or `input-unsupported` if it
reaches the host, and a host that cleared by another mechanism than the one
required fails with `input-mechanism-mismatch` after the clear applied.

`perform` names an action by what `observe`'s `actions` fact shows, such as
`AXPress`, an application's custom action, or Windows UIA `Invoke` and
`Toggle` (see [the Windows mapping](../native/windows/README.md#named-accessibility-actions)).
Names are not unique, so inside
the same input turn the service lists the element's actions again and refuses
a name the element does not publish (`action-not-published`) or publishes more
than once (`action-not-unique`). It then sends the provider the opaque key the
provider gave that one action, so the provider performs exactly the action it
listed; if the application replaced it in between, the provider refuses with
`action-changed`. The journal records that `perform` ran, never the name.

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
than its absence fails at once, and a fact the provider does not report at all
ends the wait as `unsupported` after one attempt. An event shortens a pause
only after at least 100 ms, or as long as the last evaluation took if that is
longer, so a burst of events cannot run walks of the application back to back.
The result reports `attempts` and `elapsedMs`.
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
unsupported (including a `clear` the session's strict input mode cannot perform
with one mechanism), or any act step's selector, check step, or the closing
observation reads content the operator denies, so such a refusal never lands
halfway. A `requestId` makes the whole
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

## stories and story

On a Storybook target, one with a story orchestrator, `stories` pages through
the catalog the build recorded: `entries` of `id`, `title`, `name`, and
`tags`, filtered by `filter` (any case, over id, title, and name), `limit` per
page (default 25, at most 100), from `offset`, with `next` naming the following
page. `matched` counts the stories the filter matches and `total` the catalog.
`complete` and `truncation` are always present: when matching stories after
`offset` do not fit the page, `complete` is `false` and `truncation` lists a
`limit` entry; when the page reaches the end, `complete` is `true` and
`truncation` is empty. Stories skipped by `offset` do not count. Ids are
clipped to 256 characters, titles and names to 200, and tags to 16 of 64, with
invisible characters made visible. An entry whose text was cut lists those
fields in `clipped`; a clipped `id` is not one `story` accepts. Any other target
reports both operations as unavailable with `stories-unsupported`.

`current` names the story this session selected and how it was confirmed:
`marker` when the story root's marker in the current window names it,
`unconfirmed` when the current window has no marker (a popup, say), and `none`
when the target has no story root. When the marker names a different story,
or a different render of this one, another client rendered it: `stories`
reports `changed: true`, forgets the selection, and replaces the preview
region, so references into the old render expire.

`story` renders the story `storyId` names. `action` is `select` (the default)
or `reset`, which renders it again from its initial state. An id the catalog
lacks fails with `story-unknown` before anything changes. Rendering replaces
the preview region first, so every earlier preview reference fails with
`ref-region-changed` (or `ref-expired` once its table entry is dropped), then waits up to the target's story render deadline for
the story root to confirm the story. The result gives the new `region` and the
`verification`: `marker`, or `none` on a target without a story root. A render
that does not confirm fails with `story-not-ready`, coded `timeout` when the
deadline passed, in fixed words because the cause may quote the story's own
error, with a mutation report. An unknown or partial effect quarantines the
target: replacing references cannot stop a delayed remote render. A quarantined
target refuses `story` with `target-quarantined`, and a `requestId` makes a
retry safe as it does for `act`. A story change waits on the session's queue
but not the server's input turn, as the WebDriver story routes do, because a
render may take far longer than an input.

## References and provider records

A reference is an opaque `<tag><serial>` string. The tag is random per session
and per incarnation and never reused in the process, so a reference from
another session or server cannot resolve here. Each element keeps one
reference while the table retains it in the same region, so repeated observations report unchanged
elements under unchanged references. After a preview region changes, observing a
surviving native element issues a new reference; it never revives the old one.
Application, chrome, and secondary-window references survive preview changes.
A whole-window observation without `within` reads the current window rather than
asserting an earlier preview's lifetime. Immutable captures remain readable until
artifact eviction or session end; they are not live preview references.
A reference pins its window and keeps
working while another window is current. The table holds at most 2,000
references per session. Beyond that it drops references into a replaced preview
region first, then the least recently returned; the references an observation
just returned are never dropped by that observation.

A reference that does not resolve fails with a reason:

| Reason                    | Error code                | Meaning                                                          |
| ------------------------- | ------------------------- | ---------------------------------------------------------------- |
| `ref-malformed`           | `invalid argument`        | Not a reference; the text is never echoed                        |
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

| Reason                            | Error code                  | Meaning                                                                      |
| --------------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `invalid-envelope`                | `invalid argument`          | Not a JSON object, or an unknown request field                               |
| `invalid-request-id`              | `invalid argument`          | `requestId` is malformed                                                     |
| `unsupported-version`             | `invalid argument`          | `version` is not the catalog's                                               |
| `invalid-input`                   | `invalid argument`          | Input failed validation; names the field, never the value or an unknown key  |
| `unknown-operation`               | `unknown command`           | No such operation                                                            |
| `bounded-observation-unsupported` | `unsupported operation`     | The provider cannot observe                                                  |
| `content-denied`                  | `unsupported operation`     | The operator denied reading displayed content                                |
| `no-window`, `window-closed`      | `no such window`            | There is no window to read, or it closed                                     |
| `target-non-response`             | `unknown error`             | The application did not answer in time; retry later                          |
| `ref-…`                           | see above                   | A reference did not resolve                                                  |
| `cancelled`                       | `unknown error`             | The caller left, or the command was cancelled                                |
| `request-id-reused`               | `invalid argument`          | The `requestId` already named a different request                            |
| `action-unsupported`              | `unsupported operation`     | The provider, or the session's input mode, cannot perform this action        |
| `input-policy`                    | `unsupported operation`     | The session's input mode never delivers that mechanism; nothing dispatched   |
| `input-unsupported`               | `unsupported operation`     | The target does not deliver that mechanism, or cannot clear with only one    |
| `input-mechanism-mismatch`        | `unknown error`             | A strict clear was applied by another mechanism than the mode requires       |
| `sample-not-unique`               | `invalid argument`          | The sample proved nothing unique, or it was forgotten                        |
| `ref-not-proven`                  | `invalid argument`          | The sample proved a different reference unique                               |
| `no-match`                        | `no such element`           | `act`'s selector matched nothing                                             |
| `selector-not-unique`             | `invalid argument`          | `act`'s selector matched more than one element                               |
| `selector-inconclusive`           | `invalid argument`          | `act`'s search could not be completed                                        |
| `fingerprint-changed`             | `stale element reference`   | The element's role, name, or automation id changed                           |
| `not-enabled`, `not-visible`      | `element not interactable`  | The element cannot take the action                                           |
| `state-unsupported`               | `element not interactable`  | The provider cannot report the enabled or visible state the action needs     |
| `action-not-published`            | `element not interactable`  | The element does not publish an action by that `name`                        |
| `action-not-unique`               | `element not interactable`  | The element publishes more than one action by `name`                         |
| `action-changed`                  | `element not interactable`  | The listed action changed before it was performed                            |
| `obscured`                        | `element click intercepted` | Something else is at the element's centre                                    |
| `target-quarantined`              | `unknown error`             | An earlier change may still land; reads still work                           |
| `capture-unsupported`             | `unsupported operation`     | The provider cannot capture a window                                         |
| `element-capture-unsupported`     | `unsupported operation`     | The provider cannot capture one element                                      |
| `capture-too-large`               | `unsupported operation`     | The image is larger than 16 MiB                                              |
| `artifact-expired`                | `invalid argument`          | The capture was dropped to make room for newer ones                          |
| `artifact-unknown`                | `invalid argument`          | No capture in this session has that id                                       |
| `offset-out-of-range`             | `invalid argument`          | `artifact`'s offset is past the end of the image                             |
| `stories-unsupported`             | `unsupported operation`     | The target has no story orchestrator                                         |
| `story-unknown`                   | `invalid argument`          | The catalog has no story with that id                                        |
| `story-context-stale`             | `stale element reference`   | Another client changed the story, or it cannot be confirmed; select it again |
| `bridge-unavailable`              | `unknown error`             | The authenticated Storybook bridge is not connected; nothing was dispatched  |
| `relaunch-required`               | `unknown error`             | The launch has no usable bridge; relaunch the application, then select again |
| `observation-cursor-expired`      | `invalid argument`          | An `observePage` cursor's sample was evicted; take a fresh observation       |
| `story-not-ready`                 | `timeout`, `unknown error`  | Rendering did not confirm; check mutation/quarantine state before continuing |

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
and states stay available. `stories` and `story` stay available too: the
catalog comes from build metadata, not from what the application displays. A
request cannot change the policy.

The policy cannot see inside identifiers. An application that puts what it
displays into a name or automation id still shows it under `deny`: Calculator's
input field has the automation id `StandardInputView;value:113,463`, where the
value is what the field displays.

Each session keeps a bounded journal of 500 entries: operation, request id,
outcome, effect, timing, an error code and reason, and scalar summary fields the
operation declared safe (for `find` and `check`, the names of the predicates
and expectations, never their values; for `stories`, whether a filter was
used, never its text; for an action, a `ref` only when it is a well-formed
reference). Typed text, expected text, displayed content, unknown request keys,
malformed references, provider messages, and error messages never enter it. An
unknown key is reported as `Unrecognized key.` at its parent path, and a
malformed `ref` as `ref-malformed` without its text. The
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
host; `src/server/storyOperations.test.ts` drives the story operations against
`createDesktopDriverStoryHarness`. Enable observation on the fake with
`features: { boundedObservation: true, accessibilityActions: true }`, build large
trees with `createFakeTree` in `src/testing/fakeTree.ts`, and script slow reads,
record limits, or unreadable subtrees with the fake host's `observation`
option. Pass server options, such as the content policy, as the harness's third
argument. Parse real results against the published schemas with
`z.fromJSONSchema(entry.output)`.

On Windows, opt in with `FURN_NATIVE_DRIVER_TEST=1` and run
`yarn test --runInBand operations.contract`. The test-only plain Win32
fixture exercises the real helper through the service and typed client:
`act` (physical click, activation, type, clear, and named Invoke/Toggle),
ambiguity rejection, `check` and timed waits, `sequence` and early stop,
window/element `capture` with paged `artifact` hashes, and unsettled named
mutation quarantine. Physical click and crop geometry are qualified at 100%
and 150% scale. These are native Win32 fixture results, not React Native
Fabric or Paper application qualification.

## Limitations

- Observation depends on the provider. Real React Native application
  qualification and bounded-operation trees near the 5,000-element limit
  remain open. On macOS, a stopped application
  fails a read after about 1.5 seconds with the reason `target-non-response`, and
  the helper's memory stayed flat across thousands of reads; both were measured
  against Calculator and Font Book only
  ([details](../native/macos/README.md#bounded-observation)).
- A Windows UIA read can time out while serialized behind an unsettled
  provider action. `check` waits retry unmet predicates, not provider failures;
  after a read failure, re-observe once the application responds. A late
  action completion does not lift quarantine.
- Names come from the application. Font Book exposes three window-control
  buttons with no name, so an agent finds them by role and position.
- A provider repeats `{ "supported": false }` for every node when an
  application cannot report a fact. The projection names such facts once in
  `unsupportedFacts`, so that cost stays on the helper pipe and does not reach
  the agent.
- The first read of a freshly launched application can see fewer elements than
  the second, because applications create some elements lazily.
- Only `stories` notices a story another client rendered; `observe` and `find`
  do not yet read the story marker. A change of story args is not detected,
  and operations cannot set args yet.
- Persisting the journal, recording, and replay are follow-on work.
