# Native-core authoring

- Follow the [Apple and Office rules](../../../references/agents/native/apple-office.md)
  for shared services and renderer adapters. Paper `RCT_EXTERN_MODULE` files
  never import the generated Swift header or name generated Swift classes.
- Prefer Swift for new macOS AppKit/domain behavior. Keep ObjC/ObjC++ for
  generated protocols, C++ conversion, registration, and renderer integration.
- Paper and Fabric adapters supply resolved views and event sinks to shared
  behavior. Shared behavior must not traverse renderer registries.
- A Paper `RCTView` subclass hosted by a Fabric component view has no React tag;
  keep `RCTView` from building focus, blur, or key events for it.
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
- Use `phasedComponent` for hook-bearing wrappers: run hooks and create slots
  in the first phase and return a hook-free `directComponent`. Do not wrap an
  inner hook component; hook-driven props are consumed by the first phase.
- Keep legacy aliases/registrations and Win32 host ownership. Never send a new
  managed protocol to a baked host without capability evidence.
- Root exports require equivalent mandatory behavior on every supported
  desktop host. Platform previews, compile checks, and skipped tests are not
  root admission.
- Keep generated code generated and verify packed native ownership. Preserve
  the module-named macOS Swift interoperability header.
- Record exact executed validation and remaining work in the owning
  [Components](https://github.com/microsoft/fluentui-react-native/issues/4274)
  or [Infrastructure](https://github.com/microsoft/fluentui-react-native/issues/4275)
  workstream issue before switching machines. Keep the README and component
  contracts aligned with qualified behavior.
