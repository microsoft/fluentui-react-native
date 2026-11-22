# Trigger accessibility

The child remains the accessible control. Keep its name (including a caller-supplied `accessibilityLabel`), role,
actions, disabled state and focus ring. The tooltip is descriptive, not a live region, disclosure or second tab
stop. Do not set expanded state, move focus, or rely on discovering a transient window in the accessibility tree.

When the short text adds information, supply it once on the trigger: on macOS, `accessibilityHint` maps to AX help;
on Windows Fabric, `accessibilityDescription` maps to UIA FullDescription. The legacy Office example also puts
`accessibilityDescription` on the button; confirm the result in the actual Office host. Preserve caller-authored
help/description rather than replacing it. If the text repeats the name, do not synthesize a duplicate description.
Clear only values contributed by Tooltip when content becomes empty or the attachment ends. If a tip repeats an
implicit name, supply the same explicit `accessibilityLabel` so the wrapper can identify the match without guessing
the spoken name of an arbitrary composite from its React children.

Qualify both a named icon-only button whose tip repeats its label and a named control with distinct supplemental
text. Inspect AX/UIA properties before showing and after clearing; listen with VoiceOver/Narrator for the actual
name, role, and help, without duplicate announcements. With a disabled trigger, keep its native semantics and
never add a focus stop to reveal a tip. Essential instructions must remain available outside the tooltip.
