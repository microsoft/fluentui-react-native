---
id: desktop-driver.protocol
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

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
- Renderer is optional for non-React-Native targets.
- A registered target may restrict `launchModes`; clients cannot override that policy.

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
- click, clear, and send keys;
- perform and release actions;
- window and element screenshots;
- accessibility source.

Implemented `furn` extensions:

- `GET /session/{id}/furn/manifest`;
- `GET|POST /session/{id}/furn/story`;
- `POST /session/{id}/furn/story/reset`;
- `POST /session/{id}/furn/story/args`;
- `GET /session/{id}/furn/tree`;
- `GET /session/{id}/furn/window-events`, when the `windowEvents` feature is
  advertised in `furn:features`.

`furn/window-events` returns the helper's bounded diagnostic timeline for the
session's application: recent window notifications (created, destroyed, focus,
main-window, minimize, activation) and recent helper commands on the same
monotonic clock, each with an `ageMs`. Live window events carry a descriptor
with role, subrole, title, frame, and the matching WindowServer window so
transient popups and sheets remain identifiable after they close. The log is
evidence for diagnosis only; window and element queries remain authoritative.

Navigation, history, cookies, frames, shadow roots, prompts, printing,
arbitrary JavaScript execution, browser CSS values, and new-window creation
return `unsupported operation`.

## Timeouts

Standard implicit, page-load, and script timeout values are accepted by the
session contract. Native and Storybook operations use driver-owned bounded
deadlines rather than repurposing page-load semantics.

`DesktopTarget.launchTimeoutMs` is a positive bounded integer. The server's
deadline defaults to 120 seconds; an explicitly configured value is also
forwarded to the native launch request. Otherwise both native providers retain
their 90-second launch default within that server deadline.
Clients cannot override it through capabilities. A timed-out launch must
cancel and dispose causally owned processes before the target can be reused.

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

The `required` property and expectation report required-form state. Windows
and Win32 read UI Automation's `IsRequiredForForm` Boolean without provider
defaults. A provider that does not expose this state, including the current
macOS provider, returns `unsupported operation`, not `false`. Tree output
includes `states.required` only when the provider supplies a value.

The `helpText` property returns authoritative accessibility help text. Windows
and Win32 read UI Automation's `HelpText` without provider defaults, preserving
an explicitly empty string. Missing or unsupported help text, including on the
current macOS provider, returns `unsupported operation` instead of an empty value.

The `accessibilityActions` property (also readable as an attribute) lists the
action names the native accessibility tree publishes for an element, in provider
order, when `furn:features` advertises `accessibilityActions`. The macOS provider
reads `AXUIElementCopyActionNames` and lists an authored custom action, such as
`Toggle` or `Select`, by name without any provider handle, alongside any standard
actions the element publishes. An element that publishes none returns `[]`; hosts
without the feature, including Windows and Win32, return `unsupported operation`
rather than `[]`. The property only lists actions; it does not invoke them.
What an element publishes depends on the renderer: React Native macOS Fabric
publishes every declared `accessibilityActions` entry by `name`, while Paper
publishes only entries that declare a `label` and lists them by that label
(`C-A11Y-007` in `accessibility.action-transport-evidence`).

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

An intercepted click names the occluding element's role, name, and ID; an
external occluder names its owning application and process ID.

Error data may include bounded operation names, native diagnostic codes, and
artifact IDs. It must not expose unrestricted environment values, native
handles, or arbitrary physical paths.

On Windows, a lookup or tree read whose root remains live retries briefly when
a descendant disappears mid-read, such as a closing owned popup; only a
detached root reports `stale element reference`.

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

Run status is `passed`, `failed`, or `incomplete`. Individual tests distinguish:

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
