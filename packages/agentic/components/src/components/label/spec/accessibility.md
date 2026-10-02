# Label native accessibility

This reviewed contract is implemented in JS/native props, not qualified native
announcements. LBL-004, LBL-007, and LBL-008 passed independent pre-code review.

## Root and name

The default accessible View is intended to expose one named text element using
`accessibilityRole="text"` and `focusable=false`. Hide both Text descendants
with the existing package accessibility helper; this includes custom marker
text and caller attempts to expose a descendant. No focus ring or semantic
action is created. A compatible slot replacement must preserve this contract.
The root's owned negative tab index prevents a caller alias from overriding
its nonfocusable policy in native View processing.

Use `accessibilityLabel`, then `aria-label`, then scalar content to resolve
one native name. Treat numeric zero as a name; do not traverse element trees.
If an accessible Label's resolved name is absent, empty, or whitespace-only,
issue the existing development warning. Do not accept a labelled-by reference
as evidence that complex content has a resolved cross-desktop name.

The marker is never part of the derived name. Label does not author
disabled/required accessibility state; presentation values do not replace
the actual target's state or form instructions.

## Association boundary

A root `nativeID` is only an identifier. No automatic relation, announcement
precedence, or control activation follows from it. This contract makes no
cross-platform guarantee for `accessibilityLabelledBy` or `aria-labelledby`.
Source declaration, runtime prop forwarding, native relationship exposure,
and a screen-reader announcement are four different levels of evidence.

The documented composition gives the actual control an explicit name
matching the visible content. Do not name Input's structural View instead of
its editable `textInput` slot. Do not combine an explicit target name and a
native relation while assuming that either one universally wins.

## RadioGroup legend

Label can supply the group's visible legend at strong/medium presentation.
When the owner supplies a group name explicitly, `accessible=false` suppresses
separate Label exposure and leaves the marker decorative. The group must not
depend on a hidden Label being a resolvable native naming target.

RadioGroup owns the group role/name and the accessibility-tree arrangement.
Its container must not combine or hide the individually named radio options.
Label does not repeat the legend into each option, implement group navigation,
or claim a particular announcement sequence.

## Endpoint gates

For macOS Fabric, Windows Fabric, and Office Win32 separately, obtain:

- One intended named root, expected native text projection, no duplicate
  child/asterisk announcement, and no keyboard Tab stop.
- An editable control's native name and its Narrator/VoiceOver announcement
  using explicit naming; verify disabled and required communication on the
  control, not by reading Label's props.
- RadioGroup's native group name and entry announcement without losing option
  discovery; the RadioGroup owner supplies that integrated evidence.
- If a native labelled-by path is proposed, prove the relation and precedence
  for explicit name plus relation, missing/replaced IDs, and unmount/remount.
  Otherwise record it as unqualified rather than silently selecting a fallback.
- Text scaling, contrast/high-contrast presentation, RTL/multiline content, and
  parity between visible text and the accessible target name.

Driver-tree assertions alone do not prove speech. Missing capabilities and
unrun endpoints must be reported explicitly. The recovery worker performed
no native run; subsequent coordinator macOS execution passes seven cases,
including actual editor naming, nonforwarded Label presses, Tab exclusion,
constrained content, name precedence and native ref lifetime. See the round's
[integrated evidence](../../../../PLAN.md#integrated-evidence).
VoiceOver/Narrator speech and Windows/Win32 execution remain unrun.
