# ProgressBar usage

Use ProgressBar when a task takes long enough that the user needs to see it is
running, or when a continuous quantity is best read as a filled rail. Give every
bar a label that names the task.

```tsx
<ProgressBar label="Uploading photos" progress={uploadedPercent} />
```

## Type

Prefer `determinate` whenever a percentage can be calculated. It is the only
mode that tells the user how much is left.

Use `indeterminate` only while the duration is genuinely unknown, and switch to
`determinate` as soon as a percentage exists. The bar snaps to the calculated
value on that switch, which is the intended behavior; do not try to cross-fade.

Use `static` for a snapshot that does not advance on its own, such as storage
used against a quota or a score against a maximum. A static value is a state,
not a moving target, so framing it as progress misleads.

A determinate or static bar follows genuine decreases as well as increases, so
it can represent values such as storage usage that drops when space is freed.

## Status

`neutral` is the default and means the work is in flight with no outcome implied.
Use `error` when the task has failed and `success` when it has completed.

Both non-neutral statuses show a validation icon by default and recolor the
indicator. Pair them with value text that states the outcome, because the icon
is decorative and the bar does not announce a status change on its own. Announce
the outcome from the surrounding surface when the user must notice it.

Avoid a non-neutral status on an indeterminate bar. An outcome implies a known
result, which contradicts an unmeasured duration; move to `determinate` or
`static` and hold the final value.

## Label and value text

The label is always rendered and cannot be hidden. Replace the default text with
the name of the task; the default names nothing and is also the accessible name.

Value text defaults to the percentage for a measured bar and to a short phrase
for an indeterminate bar or a non-neutral status. Supply `valueText` when a
contextual phrase reads better than a number, such as a file count or a byte
total. Set `showValueText` to `false` in dense layouts where the number adds
nothing.

## Validation icon

The icon defaults on for the error and success statuses and off for neutral.
Override with `showValidationIcon`, replace the glyph through the
`validationIcon` slot, or pass `null` to remove it while keeping the status
color.

## Layout

The root stretches across its parent, so give it a container with a definite
width. The label grows into the available header space while the validation
icon and value text stay aligned to the trailing edge. Keep labels concise so
they do not make the header unnecessarily tall.

## Update frequency

Update the value in visible steps rather than on every byte. Frequent updates
cost a render each and produce repeated announcements on both platforms.
