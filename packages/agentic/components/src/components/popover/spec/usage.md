# Popover usage

## Retained use and constraints

Use Popover for a named, temporary composition next to an explicit trigger.
Its caller supplies trigger presentation and View-compatible content; the
component owns the toggle. The surface can disappear after native dismissal,
so it must not be the sole route to a required workflow or confirmation.

Use Tooltip for noninteractive description, Dialog for an explicitly blocking
workflow, and Menu for action-list navigation. These are conceptual choices,
not claims that those consumers are implemented or qualified by Popover.
Do not nest Popover surfaces or infer submenu coordination.

`position` is a preference, not exact geometry or portable alignment.
Content must wrap within its actual host; the retained width floor prevents
minimum-content text collapse but does not prove screen containment.
`content={null}` leaves an empty named surface; omitted content preserves
the original placeholder.

Name the trigger through its own slot. Name the popup independently through
`surfaceAccessibilityLabel`. The root stays passive. A root ref identifies
the inline View; a trigger ref identifies its native Pressable; a content
ref identifies its own View. None is a popup-window handle.

## Recovered API example

This example describes the approved recovered API. Public export wiring is
owned by the coordinator.

```tsx
import { Popover, Text } from '@fluentui-react-native/components';

<Popover
  surfaceAccessibilityLabel="Sync details"
  trigger={{ accessibilityLabel: 'Show sync details', children: <Text>Details</Text> }}
  content={{ children: <Text>Last synced 5 minutes ago.</Text> }}
/>;
```

An external owner may coordinate the boolean state:

```tsx
const [open, setOpen] = React.useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
  position="topLeftEdge"
  surfaceAccessibilityLabel="Filter options"
  trigger={{ accessibilityLabel: 'Filter options', children: <Text>Filter</Text> }}
  content={{ children: <FilterForm onDone={() => setOpen(false)} /> }}
/>;
```

Controlled state does not establish native readiness, a reason-aware dismiss
event, focus suppression, or safe restoration. Do not add unconditional
`triggerRef.current.focus()` to a close effect. A consumer-owned explicit
action knows its own reason but still needs a live target and active-window
eligibility before restoring. An outside click must retain its destination.

## Consumer boundary

The unstable state/style/render pipeline is intended for composition, not
permission to depend on undocumented window commands or private host state.
Menu must review changes to surface role, padding, item refs, keyboard owner,
and event ownership. Popover's existing dialog content host and always-requested
native initial focus are not a Menu or Tooltip realization by themselves.

The [FM feasibility report](./host-feasibility.md) lists the missing native
capabilities. Approve the bounded Popover recovery separately from Menu host
repairs. No production FocusZone import, Native Lib revival, desktop-driver
production dependency, delay-based focus, or global key hack is implied.

## Authored stories

Default, Overview, Placement, Content, ExternallyDrivenOpenState, and
Accessibility demonstrations are retained, without a `focused` arg.
ControlledRequests, FocusManagement, DisabledDismissal, AttachmentLifetime,
ConstrainedContent, and PopupThemeAndModality provide focused scenarios.
Module styles precede metadata. All native cases are NOT RUN here.

All executable cases use top-level named `wdio` callbacks typed with
`WdioStory`; import Node helpers dynamically inside callbacks. Keep uncontrolled
`defaultOpen` in ordinary args; controlled stories must deliberately own or
hold the value. The coordinator adds test-bearing files to story type coverage.
Native cases need stable per-instance IDs and owned popup lookup; no invented
window title, focus-changing observation, or unsupported-state default.

## Reviewed unstable Menu composition

Ordinary `<Popover>` usage and props do not change. The
[P1/P2 API](./composition-amendment.md) extends only the unstable
state stage for reviewed macOS Menu composition. A submenu would supply its
already committed MenuEntry row ref/generation/lifetime, not another trigger
or a private `usePopoverAnchor` import. It would bind the actual mounted host
and wait for native readiness before owner-selected focus.

The options are implemented following independent review. No raw Callout props, public native
handle, arbitrary restore target, family ID, or Windows/Win32 managed
fallback is authorized. A Menu consumer must not implement against these
documentation without completing the coordinator's integration/native gates.
An ordinary call returns `PopoverState` with a required trigger; a composition
call returns `PopoverCompositionState`, whose trigger may be absent for an
external row. Both use the same style and render stages.
