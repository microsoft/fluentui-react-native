---
id: desktop-driver.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

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
| `src/authoring`    | Static JSON plan and result schemas, and the case descriptor            |
| `src/runner`       | Plan selection, capability checks, execution, and classification        |
| `src/wdio`         | Sanctioned WebdriverIO connection and commands                          |
| `src/client`       | Low-level typed W3C client                                              |
| `src/authority`    | Grants, private discovery records, and platform ownership adapters      |
| `src/agent`        | JSON-safe agent API; `describe` trims an unbounded tree read            |
| `src/operations`   | Versioned agent operations, references, release ledger, and journal     |
| `src/artifacts`    | Evidence naming, confinement, and atomic writes                         |
| `src/testing`      | Reusable fake harnesses, never production fallback                      |
| `src/cli`          | CLI parsing and structured-result adaptation                            |

Do not duplicate native build, cache, or verification logic in Storybook
consumers. Do not move Storybook manifest generation or app lifecycle into this
package.

## Case descriptors and input lanes

`src/authoring/input.ts` and `src/authoring/selection.ts` are the one
implementation of the test case descriptor (`requires`, `input`, `platforms`,
`scope`, and declared gaps). Storybook extraction and its runner, and the
desktop-test Jasmine adapter, all call them; do not reimplement validation,
merging, or a decision in a consumer. Keep both files pure data and functions,
with no Node, React, or WebdriverIO imports, because stories and workers load
them. `input.ts` also has no runtime imports at all (its one import is a type),
and the `./authoring/input` subpath exports it directly: desktop-test's config
loader reads scope domains from it, and a config file is loaded from source
through a CommonJS fallback that cannot resolve this package's `.js`
specifiers, so keep it that way.

- Add a requirement to `desktopRequirements`, to the physical or accessible
  requirement set in `input.ts` when it implies an input, and to the
  `requirementFeature` map in `selection.ts` for the host feature that backs it,
  together. A requirement whose feature a host did not report is unmet.
- `mergeDesktopCaseOptions` only narrows: requirements union, `platforms` and
  `scope` intersect, and a nested declaration can never widen or change its
  group's input. An overlap that is empty is an error because the case could
  never run. A group cannot carry a gap.
- `decideDesktopCase` judges platform, then scope, then the lane, so a case is
  excluded for one reason. It resolves a declared gap too, so an expired
  quarantine stops a run before anything executes.
- `resolveDesktopClickMode` lets a lane decide the click mode outright. That is
  how one `click` requirement is an accessibility click in the accessible lane
  and a physical click in the physical lane.
- `accessibleLaneMaskedFeatures` (`keyboard`, `physicalClick`, `wheel`) is what
  an accessible lane disables through the native host's `disabledInputFeatures`,
  and `unmaskedAccessibleFeatures` fails closed when a host reports any of them
  as still available. Change the set together with the hosts that apply it.

## Behavioral rules

- Reserve a target before asynchronous launch or attach.
- Keep session commands and physical input serialized.
- Propagate `AbortSignal` to every host operation.
- Do not release queues or input locks until a timed-out native command settles.
- Preserve attached apps and clean only exact owned resources.
- Callers resolve existing private-storage parent directories before opening them.
  macOS storage keeps rejecting symlink ancestors on subsequent operations and
  identifies the failing ancestor in ownership/permissions diagnostics.
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
- On macOS, observers use `NativeDesktopHost.inspectApplication`, not another
  controlling `attach`. It validates the configured descriptor and exact window
  without taking an application lock or changing session window/element records.
  Keep the exclusive per-incarnation lock on every real launch/attach.
- Add or update the opt-in Node native contract when build, cache, selection,
  signing, or handshake behavior changes.
- On Windows, extend the Win32 fixture contract
  (`src/native/windows/win32Fixture.contract.test.ts` and `fixtures/win32`) when
  a change needs a real application: events, popups, hung providers, tree
  limits, or retention.
- On Windows, change the `--private-storage`, `--service-identity`, and
  `--application-incarnation` modes together with their native self-test cases
  (`native/windows/src/authoritytests.cpp`) and the application-free contracts
  `src/native/windows/privateStorage.contract.test.ts`,
  `src/native/windows/serviceIdentity.contract.test.ts`, and
  `src/native/windows/applicationIncarnation.contract.test.ts`.

Never patch generated SwiftPM, Xcode, MSBuild output, or cached artifacts.

## Legacy static plans

The following rules describe the serializable `parameters.desktopDriver`
contract retained for compatibility. New Storybook test authoring uses named
`wdio` callbacks owned by `@fluentui-react-native/storybook-desktop`.

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
- [references/protocol.md](protocol.md) is the public wire/behavior contract.
- [native/PROTOCOL.md](../native/PROTOCOL.md) is the private helper protocol.

When completing planned work, document the resulting behavior first, then
update its tracking issue. Do not preserve implementation history as active
instructions.

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
