# Menu usage

The reviewed API below is authored locally. The coordinator owns package-root
exports and integrated validation; these examples do not claim native readiness.
The approved delivery intent is full macOS Menu first. Windows/Win32 use will
be rejected explicitly before rendering, including closed Menu instances;
there is no reduced or native-declaration-only fallback. Guard a caller's
feature at the platform boundary rather than catching failures to display a
fake menu. Package import itself remains safe.
MenuEntry is the explicit collection adapter; it reuses MenuItem's native row
without adding another native wrapper. Do not expect an arbitrary MenuItem
or opaque custom child to register itself.

## Commands

This example describes the intended constrained composition:

```tsx
<Menu
  surfaceAccessibilityLabel="Document commands"
  trigger={{ accessibilityLabel: 'Document commands', children: <Text>Commands</Text> }}
  content={{
    children: (
      <>
        <MenuItem menuStyle="section-header" content="Document" secondaryContent={null} />
        <MenuEntry itemId="save" content="Save" secondaryContent={null} onAction={saveDocument} />
        <Divider label={null} icon={null} />
        <MenuEntry itemId="archive" content="Archive" secondaryContent={null} onAction={archiveDocument} />
      </>
    ),
  }}
/>
```

Explicitly pass null secondary text when none is wanted: MenuItem's current
default remains a visible secondary placeholder. Divider also defaults to a
label, so use null for an undecorated separator. Those leaf defaults are not
changed by this contract.

Stable item IDs describe commands, not positions. Keep React keys stable when
mapping entries. Use textValue for a searchable text equivalent when the
visible primary label needs different character matching; it does not rename
the row for accessibility.

## External choices

An owning scene supplies selected values and updates them from the semantic
action. The proposed checkbox command closes after its choice:

```tsx
<MenuEntry
  itemId="show-markup"
  content="Show markup"
  secondaryContent={null}
  checkable="checkbox"
  selected={showMarkup}
  onAction={() => setShowMarkup((current) => !current)}
/>
```

Radio commands require selectionGroup as well as selected. The caller ensures
at most one selected peer in that group. Arrow navigation never changes these
values. Use separate stories to exercise a native named action as well as a
physical press; neither is a proxy for the other.

`onAction` may receive undefined for real eventless macOS Fabric AX activation.
Handlers that need the original press/named-action event must check its
presence. Eventless callbacks use the same external choice semantics:
checkbox requests inversion and radio requests selection; a selected radio
does not toggle off. An onAccessibilityTap observer runs once after the owned
request and before guarded close, without a synthesized onPress. Submenu tap
requests open only. Disabled rows retain their native observer without acting.

Ordinary stories use defaultOpen rather than a pinned controlled open arg.
A controlled scene deliberately owns open and onOpenChange. A native-hidden
session cannot be kept alive simply by refusing its false request.
Do not add trigger-ref focus to an open effect or unmount cleanup.

## Submenu proposal

```tsx
<MenuEntry
  itemId="export"
  content="Export"
  secondaryContent={null}
  submenu={{
    surfaceAccessibilityLabel: 'Export formats',
    content: {
      children: <MenuEntry itemId="pdf" content="PDF" secondaryContent={null} onAction={exportPdf} />,
    },
  }}
/>
```

The submenu owns its open triple unless submenuOpen is provided. It anchors
to this existing row and must not render another trigger. Root plus two child
levels is supported by the proposed API, with one sibling branch presented.
The native additions and Popover semantic options are delivered and consumed.
Their [native acceptance gates](./feasibility.md) are not established by the
example, a build, or a rendered state counter.

Child Escape/back arrow returns conditionally to its own parent row. Activating
a leaf closes the entire native family and can return only to the root trigger.
Do not manually close ancestors or refocus rows in action/close effects.
Programmatic branch replacement closes without returning.

## Boundaries

Menu is not a modal form, permanently expanded navigation region, editable
listbox, or split-action menu row. No root hover-open, persistent-checkbox
mode, context-point anchoring, or selection-follows-focus API is proposed.
Shortcuts/context gestures may request open against the declared live trigger.
Checkable/submenu identity is not a Storybook control that changes a mounted
row's semantic kind; demonstrate each with stable focused stories.

Use ThemedRoot for the scene; popup content keeps the same controller/theme
through Popover. Keyboard opening, native action invocation, and hover are
different scenarios. On macOS delegate return, bare Escape and Tab/Shift+Tab
to the native transactions and respect a caller action that moved focus.
Tab leaves the family through the natural owner loop; it does not select a
caller-provided next ref. Genuine native movement controls hover suppression.

Later Win32 admission must preserve Callout's default restoration with
onRestoreFocus unset. Do not substitute a managed command or JS refocus there.
That is a parity requirement, not permission to use macOS-first Menu on Win32.

Missing pointer, focus, announcement, geometry, or native-action evidence
blocks its readiness claim. Neither a renderable example nor an existing leaf
story closes #4232 or establishes full pinned/macOS conformance.
