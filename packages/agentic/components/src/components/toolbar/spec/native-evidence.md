# Toolbar native qualification

## Coordinator integration, 2026-10-02

Package lint/build, strict story typing, runtime/type tests, explicit exports,
root build and all desktop bundles pass. Actual subsequent macOS case results
and remaining projection/action/announcement gates are recorded in the round's
[integrated evidence](../../../../PLAN.md#integrated-evidence).
The worker NOT RUN table below is historical, not the final coordinator status.
Windows/Win32 native execution remains unrun.

As of 2026-10-01, the bounded Toolbar/ToolbarButton implementation and executable
stories are authored. **No Toolbar native endpoint has been run in this worker
session.** The coordinator owns native instances and integrated validation.

| Endpoint       | Status  | Passed | Failed | Skipped | Reason                                                   |
| -------------- | ------- | ------ | ------ | ------- | -------------------------------------------------------- |
| macOS Fabric   | NOT RUN | 0      | 0      | 0       | Native instance and qualification are coordinator-owned. |
| Windows Fabric | NOT RUN | 0      | 0      | 0       | Native instance and qualification are coordinator-owned. |
| Office Win32   | NOT RUN | 0      | 0      | 0       | Native instance and qualification are coordinator-owned. |

Zero counts mean no execution, not successful zero-failure qualification.
No app, driver, target, screenshot, keyboard-setting, or renderer-run identity
is invented here. Existing Button/TabList results are compatibility evidence,
not new Toolbar results.

## Authored coverage

`toolbar.stories.tsx` contains named physical-key tests for one-stop entry and
Tab exit, disabled/separator skipping, horizontal wrap/Home/End, RTL mapping,
external selection/activation counts, modifier forwarding, native group and
child preservation, inactive pointer activation, held-key phase/repeat counts,
and removal without outside-focus theft.

Unit tests cover target request status and cancellation but do not prove
native delivery. The native descriptors were derived from the installed
RNmacOS View, RNW Fabric Composition View, and actual Office Win32 View
runtime. Win32's TypeScript declaration uses stale key/eventPhase fields;
the shipped runtime matches code/handledEventPhase. No native fork imports
or unsafe casts are needed in Toolbar's platform-neutral descriptor helper.

## Remaining gates

TBR-006/007 require real focus requests, eligibility commit, confirmed target
focus, both native Tab exit directions, and no competing native key loop on
each endpoint. TBR-010 requires named toolbar grouping without collapsing the
children, actual native checked/disabled state where supported, native action
invocation, and VoiceOver/Narrator announcements.

Test native/custom child focus-ring visibility, active/inactive windows,
contrast/themes/scaling, constrained target geometry, and dynamic
disable/reorder/ref-host replacement. Record macOS Keyboard navigation
settings without silently changing preferences. Existing RNmacOS projection
gaps remain renderer gaps; do not substitute rendered state for AX results.

JavaScript caller cancellation prevents Toolbar's own navigation. It cannot
undo a native handled-key descriptor already matched for that event. Document
observed event delivery and exact native capability limits during qualification.

Package lint/build/runtime/type/story checks, Storybook bundles/discovery, and
root exports remain **DEFERRED**, not passed. Local authored implementation,
public integration, and endpoint readiness are separate milestones.
