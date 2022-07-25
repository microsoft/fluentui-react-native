# Notification

## Variants

| Variant           | Light     | Dark      |
| ----------------- | --------- | --------- |
| Primary           | `#EBF3FC` | `#082338` |
| Neutral           | `#FAFAFA` | `#333333` |
| PrimaryBar        | `#EBF3FC` | `#082338` |
| PrimaryOutlineBar | `#FFFFFF` | `#000000` |
| NeutralBar        | `#F0F0F0` | `#3D3D3D` |
| Danger            | `#FDF6F6` | `#3F1011` |
| Warning           | `#FFFBD6` | `#4C4400` |

## Icon

Non-bar notifications can include an optional `icon` that appears to the left of the `message`.

## Title

Non-bar notifications can include an optional `title` that appears on top of the `message`. The `message` will then become subtext.

## Button

Depending on what props are passed in, either an action button or dismiss button will be rendered as the `button`.

- If the props contain an action to be performed (an onActionPress callback function) and an action text, the action button will be rendered.
- If the props contain an action to be performed but no action text, the dismiss button will be rendered.
- In all other cases, no button will be rendered.

## Callback Functions

| Prop            | Description                                           |
| --------------- | ----------------------------------------------------- |
| `onPress`       | Action performed by pressing the entire notification. |
| `onActionPress` | Action performed by pressing the `button`.            |
