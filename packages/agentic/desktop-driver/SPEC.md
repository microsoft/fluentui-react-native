# Desktop Driver Contract

## Scope

Desktop Driver is a W3C WebDriver Classic-compatible native desktop remote end.
It intentionally implements native application semantics rather than
pretending to be a browser.

V1 platform names are `macos` and `windows`; endpoint names are `macos`,
`windows`, and `win32`.

## Sessions and targets

- Targets are registered by the server.
- Capabilities select a target with `furn:target`.
- Capabilities never carry executable paths, environment variables, or output
  directories.
- Exactly one active session may own a physical target.
- Commands are serialized per session, and input operations share one global
  mutex.
- A target records whether the application was launched or attached.
- Deleting an attached session preserves the application.
- Cleanup uses owned process identity, never process-name matching.

Supported extension capabilities:

- `furn:target`;
- `furn:endpoint`;
- `furn:renderer`;
- `furn:clickMode`: `physical`, `accessibility`, or `auto`;
- returned `furn:features`.

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
- perform/release actions;
- window and element screenshots;
- accessibility source.

Implemented `furn` extensions:

- `GET /session/{id}/furn/manifest`;
- `GET|POST /session/{id}/furn/story`;
- `POST /session/{id}/furn/story/reset`;
- `POST /session/{id}/furn/story/args`;
- `GET /session/{id}/furn/tree`.

Navigation, cookies, frames, shadow roots, prompts, printing, arbitrary
JavaScript execution, and browser CSS behavior return `unsupported operation`.

## Elements

Public references use only the standard
`element-6066-11e4-a52e-4f735466cecf` key with session UUIDs. Native handles,
UIA runtime IDs, AX references, React tags, and HWNDs are private.

Every command validates native liveness. Story reset increments the preview
generation and invalidates preview elements while preserving live application
and Storybook chrome references.

Pointer and wheel actions may use WebDriver element origins. The server resolves
the public session element UUID, validates preview generation and native
liveness, and passes only `{ elementId: <native-id> }` to the host contract.
Public WebDriver element references never cross into platform providers.

Every host operation receives an `AbortSignal`. On timeout, the server aborts
the host operation before input release, session teardown, or a subsequent
command. Providers must stop side effects and settle promptly; they may never
apply late input after cleanup.

Portable lookup uses accessibility ID, normalized role, accessible name, and
the namespaced `-furn:text` strategy. Deterministic authored interactions use
`testID`.

## Storybook readiness

The runtime and server validate:

- instance, target, endpoint, and catalog identity;
- a private bridge nonce;
- request and run IDs;
- portable-plan digest;
- preview generation;
- the native story-root marker.

Only the authenticated bridge client can complete or fail a selection. Every
test receives a new run ID and keyed preview remount.

## Results

Run status is `passed` or `failed`. Tests distinguish `passed`, `failed`,
`skipped`, `timed-out`, `cancelled`, and `infrastructure-error`. Steps record
status, duration, error, and artifacts.

Unsupported required capabilities are skipped explicitly. An unavailable
native property never becomes a false-shaped passing assertion.
