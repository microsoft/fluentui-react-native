---
name: teaching-popover
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# TeachingPopover

## Scope

A nonblocking coachmark for an existing feature. It adds instructional structure and optional steps to a native
anchored Popover; it is not a tooltip, application modal or product-managed tutorial scheduler.

## Public contract

| Proposed prop                                | Default                                       | Purpose                                                                                                                                         |
| -------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger / title / children`                 | required anchor/trigger and localized content | Header close button, image, explanatory body and footer actions are optional according to the lesson. The surface must have a meaningful name.  |
| `open / defaultOpen / onOpenChange`          | uncontrolled, closed                          | Request user-driven changes by reason. A programmatic opener must provide a live view anchor and a valid return destination.                    |
| `steps / step / defaultStep / onStepChange`  | one step, initially first                     | Stable step keys; a controlled step changes only when the owner accepts. Display noninteractive localized progress text.                        |
| `primaryAction / secondaryAction / onFinish` | caller supplied                               | Allow completion, deferral, Back or Next as appropriate. Completing and deferring are not interchangeable; re-show policy is application-owned. |

### Slots and ownership

Stable structural ref with a single anchored nonmodal surface. Header, optional image, title/body, stepper and
buttons live inside it. Preserve the same mounted footer action across a change of step when still valid.

Related contracts used by this design: [Popover](../popover/SPEC.md), [Button](../button/SPEC.md).

### Data and callbacks

`onStepChange(key, { reason: 'next' | 'back' })` is separate from `onFinish()` and dismissal. A caller changing
the controlled step must not trigger a finish event. A missing anchor means not presented, never an unanchored
surface at a guessed screen origin.
Steps contain a `key`, `title`, `body` and optional decorative image. Supply localized `nextLabel` and `backLabel`
for navigation and `formatStep` for visible progress. On the final step an optional `primaryAction` can request
completion and closing; `secondaryAction` and `closeLabel` do not invoke `onFinish`.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TCP-001:** Advancing updates content in place, not by dismissing and reopening. Never call completion on a Back, deferred close or external prop change.
- **TCP-002:** Escape returns to an eligible opener; an outside click retains its destination. The target is natural Tab exit across the surface boundary, not a persistent coachmark trap.
- **TCP-003:** Delegate surface, placement and focus appearance to Popover and Button. Reflow instructional content and suppress nonessential motion under reduced motion.
- **TCP-004:** Expose named nonmodal interactive help; announce a changed step once without involuntarily moving focus to the title or losing the advancing action.

## Platform behavior

A true Text fragment is not an assumed anchor. Respect Popover's live View boundary and record actual
owner-relative Tab behavior, especially Win32 forward continuation, rather than promising behavior that has not
been qualified.

## Divergences from Flex

- `coachmark-nonmodal-exit` — **accepted.** Prefer native nonmodal return by reason and eventual natural Tab exit over cycling Tab and restoring the opener on every dismissal.
- `coachmark-tab-continuation` — **deferred.** Qualify the actual popup host's boundary traversal; a temporary contained cycle is not the intended behavior.

## Conformance

Advance and retreat without remounting, click a different control to dismiss, then repeat with Escape and
forward/backward Tab. Compare actual focus targets and lesson events.

The [requirement evidence](spec/source.json) tracks native focus and actual speech separately from step and
presence ownership.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
