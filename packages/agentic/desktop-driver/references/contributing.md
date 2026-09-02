# Contributor reference

This page expands the repository instructions in [AGENTS.md](../AGENTS.md).
Keep AGENTS.md as the instruction entry point and this file as detailed,
change-oriented guidance.

## Put changes in the owning module

| Area               | Owns                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `src/protocol`     | W3C parsing, actions, capabilities, deadlines, and error mapping        |
| `src/server`       | HTTP routing, targets, sessions, windows, elements, and shutdown        |
| `src/host`         | Platform-neutral host and application contracts                         |
| `src/hosts/fake`   | Deterministic contract-test behavior                                    |
| `src/hosts/native` | Process lifecycle, FDR1 framing, cancellation, and native adaptation    |
| `src/native`       | Source build, cache, selection, verification, and native artifact types |
| `native/macos`     | Swift implementation and self-test                                      |
| `native/windows`   | Shared C++ Windows/Win32 implementation and self-test                   |
| `src/authoring`    | Static JSON plan and result schemas                                     |
| `src/runner`       | Plan selection, capability checks, execution, and classification        |
| `src/wdio`         | Sanctioned WebdriverIO connection and commands                          |
| `src/client`       | Low-level typed W3C client                                              |
| `src/agent`        | Bounded agent-facing operations                                         |
| `src/artifacts`    | Evidence naming, confinement, and atomic writes                         |
| `src/testing`      | Reusable fake harnesses, never production fallback                      |
| `src/cli`          | CLI parsing and structured-result adaptation                            |

Do not duplicate native build, cache, or verification logic in Storybook
consumers. Do not move Storybook manifest generation or app lifecycle into this
package.

## Behavioral rules

- Reserve a target before asynchronous launch or attach.
- Keep session commands and physical input serialized.
- Propagate `AbortSignal` to every host operation.
- Do not release queues or input locks until a timed-out native command settles.
- Preserve attached apps and clean only exact owned resources.
- Keep native events advisory and queries authoritative.
- Use opaque public window/element IDs and native liveness checks.
- A Storybook preview reset invalidates preview elements, not app chrome or
  still-live secondary windows.
- Reject unknown capabilities, plan fields, native frames, and unsupported
  state explicitly.

## Native changes

- Update `native/protocol.json` and [native/PROTOCOL.md](../native/PROTOCOL.md)
  together when the FDR1 contract changes.
- Keep frame parsing bounded and recoverable where the protocol permits.
- Build only into external staging/cache roots.
- Verify the actual long-lived process before registering a target.
- Preserve release-only crash recovery and the cross-process physical-input
  lock.
- Add native self-tests for provider-local parsing, state, cancellation,
  identity, capture geometry, or recovery changes.
- Add or update the opt-in Node native contract when build, cache, selection,
  signing, or handshake behavior changes.

Never patch generated SwiftPM, Xcode, MSBuild output, or cached artifacts.

## Authored plans

- Keep plans inline and statically extractable under
  `parameters.desktopDriver`.
- Prefer stable `testID` selectors for actions and role/name assertions for
  semantic validation.
- Use `requires` and `platforms` for divergence.
- Preserve serializability through manifests, runner results, CLI JSON, and
  agent output.
- Do not add an imperative sidecar until a demonstrated scenario cannot be
  represented safely by the static contract.

## Documentation ownership

- [README.md](../README.md) is the user entry and documentation index.
- `references/` holds long-form user and contributor guidance.
- `native/<provider>/README.md` documents provider implementation and
  operations next to its source.
- [PLAN.md](../PLAN.md) contains only unfinished or deferred work.
- [references/protocol.md](protocol.md) is the public wire/behavior contract.
- [native/PROTOCOL.md](../native/PROTOCOL.md) is the private helper protocol.

When completing planned work, document the resulting behavior first, then
remove the completed task from PLAN.md. Do not preserve implementation history
as active instructions.

## Validation order

During iteration, run the smallest affected test. Before completing a package
change:

```sh
yarn format
yarn lint
yarn build
yarn test
```

For native changes on the target OS:

```sh
FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand
```

For stable macOS signing:

```sh
FURN_NATIVE_DRIVER_TEST=1 \
FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY="<identity>" \
  yarn test --runInBand
```

After fixing a failed step, rerun that step and downstream checks. Changes to
public types, exports, package contents, manifests, project references, or
dependencies also require relevant root build/publishing checks. Changes to
Storybook orchestration require its package tests and the affected real
endpoint smoke lifecycle.

Do not treat a fake-host pass as native qualification. Native authority,
physical input, capture, DPI/scale, multi-window, signing, and ownership claims
require the corresponding real-machine evidence.
