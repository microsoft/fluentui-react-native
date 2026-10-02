# Label composition

These examples describe the reviewed, locally implemented API. Public exports
and story inclusion are coordinator-owned integration steps.

## Naming an editable control

Keep the visible text and the actual editor's explicit native name together.
This does not depend on a native labelled-by relation.

```tsx
import { Input, Label } from '@fluentui-react-native/components';

const displayNameLabel = 'Display name';

<Label content={displayNameLabel} nativeID="profile-display-name-label" required />
<Input
  textInput={{
    accessibilityLabel: displayNameLabel,
    accessibilityHint: 'Required field',
  }}
/>;
```

The hint is application-supplied required-field context, not proof that every
screen reader announces required state or hints. Verify the actual target's
name and required/disabled communication. Do not use Label's marker as the only
accessible required-field instruction.

The `nativeID` above is useful for identity and future qualified relationships;
it is not necessary for this explicit naming path. Do not promise association
simply because Label and Input are adjacent or carry matching references.

## Supplying a RadioGroup legend

The RadioGroup owner can compose the following visual legend and supply the
same localized `deliveryQuestion` string as its own explicit native group
name. This is a proposed integration boundary, not a new RadioGroup API.

```tsx
const deliveryQuestion = 'Delivery preference';

<Label accessible={false} content={deliveryQuestion} nativeID="delivery-preference-legend" required size="medium" weight="strong" />;
```

The group owner still has to preserve separately accessible options and prove
the group name/announcement on each endpoint. A hidden legend cannot be assumed
to provide a native reference relationship. Label is not a general section
heading or a replacement for per-option names.

## Customization constraints

Supply content through `content`, not root children. For complex content or a
replacement that changes what scalar children display, provide an explicit
Label name when the root is accessible. Keep replacement slots non-interactive
and ref-compatible.

`requiredIndicator=null` suppresses the visual marker even with
`required=true`; it does not change the associated target's requirements.
Custom indicator text is decorative too. The application remains responsible
for an understandable visible and accessible required-field convention.

Match Label size to the surrounding control layout. The consumer owns spacing
to the control, helper/validation text, and field/group semantics. Label owns
only its internal text/marker spacing. Keep sufficient width and height for
long translations and enlarged native text; no single-line limit is imposed
by default.

Use the package Text component for unrelated prose. Do not attach a focus
method, activation handler, unsupported required state, or an HTML-style
association prop to Label.
