# Notification

## Variants

Primary
Neutral
PrimaryBar
PrimaryOutlineBar
NeutralBar
Danger
Warning

## Notification Button

Depending on what props are passed in, either an action button or dismiss button will be rendered as the Notification Button.

- If the props contain an action to be performed (an onActionPress callback function) and an action text, the action button will be rendered.
- If the props contain an action to be performed but no action text, the dismiss button will be rendered.
- If the props contain neither but the variant indicates a toast notification, the dismiss button will be rendered.
- In all other cases, no button will be rendered.
