# Native Core agent instructions

This is the instruction root for `@fluentui-react-native/native-core` and every descendant. The package owns modern
native-backed components and modules, the legacy Callout and FocusZone wrappers, and their macOS and Windows native
implementations.

## Start here

Read the [user guide](README.md), then select the narrowest topic in the [reference index](references/README.md):

| Task                                                          | Read                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Public entry points, legacy wrappers, shims, or autolinking   | [Entry points](references/entry-points.md)                                    |
| Modern Callout, FocusZone, popups, or their platform behavior | [Modern components](references/modern-components.md)                          |
| JavaScript, spec, native layout, or renderer adapters         | [Architecture](references/architecture.md)                                    |
| Codegen, registration names, podspecs, or package contents    | [Codegen, registration, and publishing](references/codegen-and-publishing.md) |
| macOS accessibility that depends on the RNmacOS patch         | [RNmacOS patch](references/rnmacos-patch.md)                                  |
| Validation, native stories, or the Apple boundary probe       | [Contributing](references/contributing.md)                                    |
| Planning work or checking open gates                          | [Remaining work](references/remaining-work.md)                                |

Native changes use the `implement-native-component` skill. Apple changes follow the repository's Apple and Office
rules (R-APPLE-001 through R-APPLE-007, in `native.apple-office`); Windows Fabric views follow `native.windows-fabric`.

## Invariants

- Follow R-APPLE-001 through R-APPLE-007 for shared services and renderer adapters. Paper `RCT_EXTERN_MODULE` files
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
- Record exact executed validation in the owning
  [Components](https://github.com/microsoft/fluentui-react-native/issues/4274)
  or [Infrastructure](https://github.com/microsoft/fluentui-react-native/issues/4275)
  workstream issue before switching machines. Keep the references and component
  contracts aligned with qualified behavior, and track open work only in
  [remaining work](references/remaining-work.md) (R-PKGDOC-009).

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` in this package, plus
`yarn codegen:windows --check` after schema changes and `yarn test:apple-integration` after macOS changes. Native
qualification requires the native story lanes in [contributing](references/contributing.md#delivery-and-validation).
Add a changeset and finish with `yarn clean-lage-cache` followed by `yarn lage buildci`.
