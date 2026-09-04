# WebDriver contract

Desktop Driver is a W3C WebDriver Classic-compatible native desktop remote end.
It implements native application semantics rather than claiming browser
conformance.

V1 platform names are `macos` and `windows`. Endpoint names are `macos`,
`windows`, and `win32`.

## Sessions and targets

- Targets are registered by the server.
- Capabilities select one target with `furn:target`.
- Capabilities never carry executable paths, environment variables, helper
  selection, leases, or output directories.
- Exactly one active session may own a physical target.
- Commands are serialized per session and input operations share a global
  mutex.
- A target records whether the application was launched or attached.
- Deleting an attached session preserves the application.
- Cleanup uses exact process identity, never process-name matching.

Supported extension capabilities:

- `furn:target`;
- `furn:endpoint`;
- `furn:renderer`;
- `furn:launchMode`: `launch` or `attach`;
- `furn:clickMode`: `physical`, `accessibility`, or `auto`;
- returned `furn:features`.

Capability matching implements W3C `alwaysMatch` and ordered `firstMatch`,
rejects duplicate merge keys, and returns `session not created` when no
registered target can satisfy a candidate.

## W3C routes

Implemented standard behavior:

- status and new/delete session;
- get/set timeouts;
- current window, handles, switching, closing, and rectangles;
- element lookup from a window or element;
- active element;
- element name, text, attribute, property, rectangle, enabled, selected, and
  displayed queries;
- click, clear, send keys, and the driver extension
  `POST /session/{id}/element/{elementId}/furn/focus`;
- perform and release actions;
- window and element screenshots;
- accessibility source.

Implemented `furn` extensions:

- `GET /session/{id}/furn/manifest`;
- `GET|POST /session/{id}/furn/story`;
- `POST /session/{id}/furn/story/reset`;
- `POST /session/{id}/furn/story/args`;
- `GET /session/{id}/furn/tree`.

Navigation, history, cookies, frames, shadow roots, prompts, printing,
arbitrary JavaScript execution, browser CSS values, and new-window creation
return `unsupported operation`.

## Timeouts

Standard implicit, page-load, and script timeout values are accepted by the
session contract. Native and Storybook operations use driver-owned bounded
deadlines rather than repurposing page-load semantics.

Every host operation receives an `AbortSignal`. On timeout, the server aborts
and drains native work before input release, teardown, or a later command. A
provider may never apply late input after timeout cleanup.

## Elements and selectors

Public references use only the standard
`element-6066-11e4-a52e-4f735466cecf` key with session UUIDs. Native handles,
UIA runtime IDs, AX references, React tags, and HWNDs remain private.

Every element command validates native liveness. Story reset increments the
preview generation and invalidates preview elements while preserving live app
and Storybook chrome references.

Pointer and wheel actions may use WebDriver element origins. The server resolves
the public UUID, validates generation and liveness, and passes only the native
element ID to the host.

Portable lookup strategies:

| WebDriver strategy  | Native meaning                                     |
| ------------------- | -------------------------------------------------- |
| `accessibility id`  | Stable React Native `testID`/automation identifier |
| `tag name`          | Normalized accessibility role                      |
| `link text`         | Exact accessible name                              |
| `partial link text` | Partial accessible name                            |
| `-furn:text`        | Normalized visible/value text                      |

CSS and XPath are not redefined for non-DOM trees.

## Errors

| Condition                                         | WebDriver error             |
| ------------------------------------------------- | --------------------------- |
| Target cannot launch or attach                    | `session not created`       |
| Missing or closed session                         | `invalid session id`        |
| Missing or closed window                          | `no such window`            |
| Lookup does not resolve                           | `no such element`           |
| Retained native node is detached or replaced      | `stale element reference`   |
| Malformed locator                                 | `invalid selector`          |
| Disabled, unfocusable, or empty-bounds target     | `element not interactable`  |
| Another node owns the hit-tested point            | `element click intercepted` |
| Capture backend fails                             | `unable to capture screen`  |
| Deadline expires                                  | `timeout`                   |
| Capability, property, or operation is unavailable | `unsupported operation`     |

Error data may include bounded operation names, native diagnostic codes, and
artifact IDs. It must not expose unrestricted environment values, native
handles, or arbitrary physical paths.

## Storybook readiness

When a target provides a `StoryOrchestrator`, the consumer validates:

- instance, target, endpoint, and catalog identity;
- a private bridge nonce;
- request and run IDs;
- portable-plan digest;
- preview generation;
- the native story-root marker.

Only the authenticated runtime bridge can complete or fail selection. Every
test receives a new run ID and keyed preview remount.

## Results and capabilities

Run status is `passed` or `failed`. Individual tests distinguish:

- `passed`;
- `failed`;
- `skipped`;
- `timed-out`;
- `cancelled`;
- `infrastructure-error`.

Steps record status, duration, error, and artifact references. Unsupported
required capabilities skip explicitly. An unavailable native property never
becomes a false-shaped passing assertion.

See [Test integration](test-integration.md) for plan and result usage,
[Service integration](service.md) for target registration, and
[native/PROTOCOL.md](../native/PROTOCOL.md) for the private Node/helper
transport.
