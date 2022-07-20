# Notification

## Variants

| Variant           | Type  | Light     | Dark      |
| ----------------- | ----- | --------- | --------- |
| Primary           | Toast | `#EBF3FC` | `#082338` |
| Neutral           | Toast | `#FAFAFA` | `#333333` |
| PrimaryBar        | Bar   | `#EBF3FC` | `#082338` |
| PrimaryOutlineBar | Bar   | `#FFFFFF` | `#000000` |
| NeutralBar        | Bar   | `#F0F0F0` | `#3D3D3D` |
| Danger            | Toast | `#FDF6F6` | `#3F1011` |
| Warning           | Toast | `#FFFBD6` | `#4C4400` |

## Icon

Toast notifications can include an optional `icon` that appears to the left of the `message`.

## Title

Toast notifications can include an optional `title` that appears on top of the `message`. The `message` will then become subtext.

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
| `onActionPress` | Action performed by the tapping the `button`.        |
