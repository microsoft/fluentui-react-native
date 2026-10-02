# Popover recovery evidence status

## 2026-10-02 coordinator follow-up

The final integrated package passes 72 component suites / 779 tests, including
the Menu composition regressions, plus the strict story type project, package
lint/build and root build. Framework Base passes 194 tests; Callout passes 47.
All three desktop bundles and the macOS family/hit-target native build pass.
These are coordinator results, not worker-only checks or native popup
acceptance. See the round's [integrated evidence](../../../../PLAN.md#integrated-evidence).

The [P1/P2 composition amendment](./composition-amendment.md) was independently
approved on 2026-10-02. Its owned source, types, runtime regressions, and two
typed composition stories now exist. Actual native owned-child/pointer
exports are consumed; no local event/command union substitutes for them.
Read-only owned-file diagnostics and five in-memory session lifecycle
scenarios passed. The worker did not run the integrated commands; their earlier NOT RUN status
below is historical. MACOS-MENU-FIRST is an authorized direction, not family
readiness. The separate native ManagedLifecycle case initially failed with a
rendered surface but zero Show/Ready. A native attachment-order repair now
retries unchanged readiness guards after Fabric window/anchor attachment and
content insertion. Both composition cases pass with no skips after rebuilding:
native ready, controlled native-hidden invalidation, one close request,
intentional rearm, and existing-row native root attachment/no second trigger.
The root check uses its actual native ref, not an intentionally absent AX node.
The exact follow-up run and the ordinary Popover's remaining five native skips
are recorded in PLAN.md. Passive popup observation, state/action projection
and assistive-technology evidence remain acceptance gates.

`contract-reviewed` is retained pending the amended realized/native acceptance
gates. The contract does not claim `implemented` or native P/FM readiness based
on authored tests, passing mocks, bundles, or explicitly skipped native cases.

The table below records the earlier recovery worker's evidence status,
not a denial of the coordinator's subsequent integrated results.

The coordinator approved the bounded contract on 2026-10-01. Local source,
runtime/type tests, and typed named WDIO stories now exist. This file records
evidence status; it is not a native conformance result.

| Gate                                   | Status                  | Evidence and remaining work                                                                                                                                                                      |
| -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pinned source                          | Verified by coordinator | Canonical components 297, system 22, tokens 25 cache files exactly match immutable upstream inventories. Generated Agency wrappers explain envelope-tree differences; no source drift was found. |
| Owned TypeScript/TSX syntax            | Checked locally         | Read-only Babel parsing; no compilation or test execution.                                                                                                                                       |
| Owned-file types                       | Checked locally         | TypeScript 7 read-only API uses the actual project references; story inclusion is virtual until coordinator wiring. No emit or cache writes.                                                     |
| Runtime/type tests                     | Authored, NOT RUN       | `popover.test.tsx`, `popover.types.test.tsx`. Parent owns integrated validation; no passing case counts claimed.                                                                                 |
| Package lint/build/export/story checks | NOT RUN                 | Coordinator owns shared export/type-project wiring and serialized commands.                                                                                                                      |
| macOS native P                         | NOT RUN                 | Actual anchor/popup content, keyboard/actions, scaled/constrained layout, theme/modality, and ref lifetime remain required.                                                                      |
| Windows Fabric native P                | NOT RUN                 | Callout standalone discovery exclusion and host qualification remain explicit gates.                                                                                                             |
| Office Win32 native P                  | NOT RUN                 | Separate prebuilt native host, action routing, geometry and lifetime must be qualified.                                                                                                          |
| Menu FM                                | Not passed              | Separate native/focus owner work must be reviewed and integrated; bounded Popover does not consume prospective APIs.                                                                             |

Executed native cases: **0**. There are no native passed/failed/skipped counts
from this recovery.

The current Desktop Driver only reads its selected window and switching
windows calls native activation. Popover's WDIO helper never uses switching
to manufacture passive popup observation. If the current window's tree
does not expose the owned content, the case explicitly skips with the passive
lookup limitation. Such a skip blocks the corresponding P claim.

Named ExpandCollapse/AX custom-action invocation is not exposed by the current
driver protocol. Its story case explicitly records that gate rather than
inventing a command or using a pointer click as action-dispatch evidence.
Unavailable native expanded projection is reported separately. Missing
capability or critical evidence is not an intended component behavior.

Before ratification, record the exact integrated revision, endpoint/renderer
versions, commands, actual target identity, macOS Keyboard navigation setting,
scoped artifacts, and passed/failed/skipped counts with reasons. Preserve
P != FM and the approved lack of portable initial child-focus or automatic
reason-aware return.
