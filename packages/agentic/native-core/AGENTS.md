# Native-core authoring

- Prefer Swift for new macOS AppKit/domain behavior. Keep ObjC/ObjC++ for
  generated protocols, C++ conversion, registration, and renderer integration.
- Paper and Fabric adapters supply resolved views and event sinks to shared
  behavior. Shared behavior must not traverse renderer registries.
- Modern and legacy facades share private host implementations. Legacy must
  not depend on React-19-only public wrappers.
- Components and genuine modules are peer consumers of services. Do not route
  view commands through a global module or create speculative modules.
- Extract only proven reuse. Share fixtures/contracts before forcing AppKit
  and Composition into a portable C++ framework.
- AppKit mutations run on the main thread; Windows uses its owning dispatcher.
  Module invocation does not establish UI affinity.
- Scope view/anchor/focus identities to attachment, surface/window, and
  generation. Legitimate app-wide non-view services have explicit lifecycle;
  unscoped global tag/focus registries are forbidden.
- Observers, monitors, requests, and popup links have one owner and idempotent
  cleanup. Stale cleanup cannot detach a newer registration.
- Async operations settle once through actual native results. Ref availability
  is not readiness; a void focus return is not confirmation. Preserve errors,
  distinguish refusal/cancellation/unsupported/timeout, and never autoqueue
  pre-mount focus requests.
- New wrappers use React 19 ref props. FocusZone preserves its native root;
  Callout's deliberate presentation handle is documented in its contract.
- Keep legacy aliases/registrations and Win32 host ownership. Never send a new
  managed protocol to a baked host without capability evidence.
- Root exports require equivalent mandatory behavior on every supported
  desktop host. Platform previews, compile checks, and skipped tests are not
  root admission.
- Keep generated code generated and verify packed native ownership. Preserve
  the module-named macOS Swift interoperability header.
- Update [the implementation handoff](plans/modernization.md) with exact
  executed validation and remaining work before switching machines.
