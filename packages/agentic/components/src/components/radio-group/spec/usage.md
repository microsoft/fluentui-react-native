# RadioGroup composition

The component-local API below implements the independently reviewed contract.
Package exports/story type inclusion and integrated/native validation are
coordinator-owned; this owned-folder patch does not claim publication or
endpoint qualification.

## No initial answer

Use a meaningful scalar question and stable item identities. The group owns
selection; do not supply `selected` or a self-selection hook to an item.

```tsx
import { RadioGroup, RadioGroupItem } from '@fluentui-react-native/components';

<RadioGroup label="Delivery schedule">
  <RadioGroupItem value="weekday" label="Weekdays" />
  <RadioGroupItem value="weekend" label="Weekends" />
</RadioGroup>;
```

This starts unanswered. Tab entry alone does not answer it. For an initial
uncontrolled answer use `defaultSelectedValue="weekday"`. That default is
not a reactive selection prop; remount intentionally or use controlled state
to change the answer later.

## Controlled empty or selected value

```tsx
const [schedule, setSchedule] = React.useState<string | null>(null);

<RadioGroup label="Delivery schedule" selectedValue={schedule} onSelectionChange={setSchedule}>
  <RadioGroupItem value="weekday" label="Weekdays" />
  <RadioGroupItem value="weekend" label="Weekends" />
</RadioGroup>;
```

`null` is an explicit controlled no answer. Do not use `undefined` as a
controlled empty value. The parent must commit a requested answer before
keyboard navigation can focus it. Delaying or refusing the update preserves
the actual parent answer rather than briefly checking another item.
External clear is `setSchedule(null)`, not pressing the checked option.

Do not change control mode for an existing instance or provide both selected
and default values. A parent removing the selected member should normally
update its value in the same render. Otherwise the group diagnoses the stale
controlled value and renders no checked member. Uncontrolled removal clears
to null once; it never silently chooses a different answer.

## Required and unavailable choices

`required` supplies a visual legend marker, not native form validation or
qualified required-state speech. Supply understandable localized form
instructions and verify their native communication. A group may start
unanswered even when required. A hint is not a guaranteed announcement.

Individual `disabled` means unavailable, not unchecked. Group `disabled`
distributes the same effective leaf disable and visually disables Label;
it does not clear an answer. If the selected member becomes disabled it
remains checked and readable while navigation skips it. All-disabled groups
have no keyboard entry.

## Composition and customization

Use two through five items, arrays, and Fragments. Give mapped items both
`key={option.value}` and `value={option.value}`. Keep values stable when
labels are translated or order changes. Do not wrap an item in a custom
component, inject a plain Radio, nest a group, or introduce editable or
independently interactive content. Unsupported composition is diagnosed
explicitly rather than partially rendered as a different selection pattern.

The visible legend is a real Label at strong/medium presentation. It is not
an HTML legend or labelled-by target. The group supplies its own explicit
native name; option names remain specific to each option. Keep any explicit
group name override consistent with the visible question.

Use vertical layout for labels that need width; horizontal layout does not
wrap into a second navigation row. Both layouts share the same arrow behavior.
Omitted direction follows React Native's RTL setting. Explicit direction must
agree with the intended visual reading order; user styles must not reverse
that order, hide a registered item, or create another key loop.

Root refs target the group's structural View. Item refs target each native
Pressable; optional Label-internal refs are not promoted to group focus APIs.
Calling an item's native focus method is not a selection command or a
confirmed FocusTarget request. Prefer ordinary traversal and the reviewed
group actions. Compatible root-slot replacements must preserve ref forwarding,
owned native semantics, and exactly one native item target.

Use `ThemedRoot` for scene modality and shared focus visuals. Keep group and
item styles caller-last while preserving semantic ownership. Let Label and
Radio own their typography, indicator, disabled/pressed/hover precedence,
native text scaling, and native/custom focus policy.

## Stories and integration

The component-local `radio-group.stories.tsx` uses
`Components/RadioGroup`, typed Meta, deterministic `defaultSelectedValue`
controls, and named top-level WDIO callbacks typed with `WdioStory`.
Never pin the self-driving `selectedValue` in default story args.

Named stories are `Default`, `Overview`, `Orientation`, `Required`,
`Uncontrolled`, `Controlled`, `NoInitialSelection`, `Disabled`,
`ControlledRefusal`, `ControlledAcknowledgment`, `FocusManagement`,
`HorizontalFocusManagement`, `RTL`, `DynamicMembership`,
`Refs`, `AccessibilityActions`, and `ConstrainedLayout`. Native probes must
use actual state plus callback/order observations, not text as a substitute
for missing focus or checked properties. Dynamically import Node-only WDIO
helpers within callbacks; use explicit capability skips and native speech
records without inflating them into qualification.

The coordinator owns explicit package exports for RadioGroup/RadioGroupItem,
their public types and unstable state/style/render stages, the exact runtime
export test, inclusion of this test-bearing story in `tsconfig.stories.json`,
generated provenance/reporting, changeset, and serialized integrated/native
validation. No shared integration file is edited by this owned-folder patch.
