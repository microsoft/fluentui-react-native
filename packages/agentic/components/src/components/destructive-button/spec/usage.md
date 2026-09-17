# DestructiveButton usage

Use DestructiveButton when the action itself causes loss or is hard to reverse:
delete, remove, discard, revoke, permanently disable. Use Button for the
overwhelming majority of actions, including negative-sounding but reversible
ones such as Cancel, Close, and Undo.

Overusing the danger family desensitizes people to it. When everything reads as
dangerous, nothing does.

```tsx
<DestructiveButton content="Delete" onPress={deleteItem} />
<DestructiveButton appearance="subtle" content="Remove" onPress={removeRow} />
<DestructiveButton accessibilityLabel="Delete item" icon={deleteIcon} onPress={deleteItem} />
```

## Appearance

`primary` is the default and is a loud danger fill. Reserve it for the single
most consequential action on a surface: the confirm action of a delete or
discard flow. Never place two primary destructive actions on one surface, and do
not pair one beside a primary Button, because two loud fills leave the default
action ambiguous.

`subtle` is transparent at rest with danger-colored text and reveals a danger
tint on hover. Use it for inline destructive actions such as a row action in a
list, where a loud fill would overwhelm the surrounding content.

Pair a primary destructive confirm with a subtle or secondary neutral cancel.

## Content

Use a specific, consequence-revealing verb. Prefer "Delete", "Remove", or
"Discard changes" over "OK" or "Yes", especially in a confirmation dialog. The
component supplies no default label; give every instance content or an
accessible label that names the action.

Content wraps when a consumer constrains the root. Keep destructive labels short
so a wrapped or clipped label cannot hide the real outcome.

## Layout and size

Small buttons suit dense surfaces such as toolbars and table row actions,
medium is the general default, and large gives a destructive action more
physical presence. Icon sizing follows size automatically; do not override it.

Icon-only buttons need an action-oriented accessible label and visible product
context such as a tooltip. `shape` defaults to `rounded` with content and
`circle` when the button is icon-only; set it explicitly only when a surface
needs the other form.

## Confirmation

DestructiveButton styling communicates severity but does not prevent accidental
activation. Gate an irreversible action behind a confirmation surface or provide
an undo affordance. Do not use `disabled` to express that a destructive action
is blocked without explaining why nearby.

DestructiveButton is a one-shot command and exposes no selection axis. A
destructive choice that must stay active is a different pattern.
