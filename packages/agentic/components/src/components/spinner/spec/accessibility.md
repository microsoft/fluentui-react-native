# Spinner accessibility

## Native semantics

The named root exposes `accessibilityRole="progressbar"` without an imposed
busy state or progress value. A decorative spinner is hidden, with the host
region carrying the busy state instead. Verify the resulting indeterminate
progress element and name separately on Windows UIA and macOS AX.

`accessibilityRole` and `focusable` are removed from the public props because
the component owns both.

The drawing surface inside the root sets `accessible={false}`, so the circles
never appear as separate elements and never produce a second announcement.

## Naming

Name what is loading, not the indicator: "Loading messages" rather than
"Spinner". Supply `accessibilityLabel`, or `accessibilityLabelledBy` pointing at
an adjacent visible label so the visible text and the announcement stay in sync.

Development builds warn once when the root is exposed to assistive technology
with neither naming prop present. Setting `accessible={false}` is the supported
way to opt out: it removes the root from the accessibility tree and suppresses
the warning, and it is the correct choice when the surrounding region already
announces that it is busy.

## Focus and completion

The root is never focusable and never enters the keyboard tab order, so focus
cannot land on it and it cannot become the initial focus target of a dialog or
other focus-scoped surface.

The spinner does not announce completion. Mounting it means work started and
unmounting it means the work is over. When a load matters enough to be reported,
announce a short status for the region once and let the spinner carry only the
in-progress signal, so the two do not repeat each other.

## Contrast and motion

The track and the indicator resolve from neutral stroke tokens that the theme
remaps per surface, and the indicator is intentionally the higher-contrast of
the two so the moving arc stays readable at the smallest diameter.

While the platform reduced-motion setting is on, the rotation does not run and
the arc renders at its starting angle. The named role or the host's busy
state still conveys meaning; no slower rotation, fade, or pulse is substituted.
