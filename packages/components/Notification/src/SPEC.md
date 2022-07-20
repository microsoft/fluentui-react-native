# Notification

## Variants

- Toast Notifications
  - Primary
  - Neutral
  - Danger
  - Warning
- Bar Notifications
  - PrimaryBar
  - PrimaryOutlineBar
  - NeutralBar

## Icon

Toast notifications can include an optional `icon` that appears to the left of the `message`.

## Title

Toast and bar notifications can include an optional `title` that appears on top of the `message`. The `message` will then become subtext.

## Button

Depending on what props are passed in, either an action button or dismiss button will be rendered as the `button`.

- If the props contain an action to be performed (an onActionPress callback function) and an action text, the action button will be rendered.
- If the props contain an action to be performed but no action text, the dismiss button will be rendered.
- If the props contain neither but the variant indicates a toast notification, the dismiss button will be rendered.
- In all other cases, no button will be rendered.

## Callback Functions

| Prop            | Description                                          |
| --------------- | ---------------------------------------------------- |
| `onPress`       | Action performed by tapping the entire notification. |
| `onActionPress` | Action performed by the `button`.                    |
