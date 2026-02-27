# Component Name: Checkbox

## Purpose:

The goal of this Checkbox component is to allows users to switch between two mutually exclusive options (checked or unchecked,
on or off) through a single click or tap. It can also be used to indicate a subordinate setting or preference when paired with another control.

## Do's:

- Allow users to choose any combination of options when several Checkboxes are grouped together.

## Don't:

- Don't use a Checkbox as an on/off control. Instead use a toggle switch.
- Don’t use a Checkbox when the user can choose only one option from the group, use radio buttons instead.
- Don't put two groups of Checkboxes next to each other. Separate the two groups with labels.

## Sample Code:

```
<Checkbox label="This is the label (uncontrolled)" onChange={onChange} defaultChecked={false} />
<Checkbox label="This is a controlled Checkbox" onChange={onChangeControlled1} checked={isCheckedControlled1} />
```

## Tokens:

Checkbox supports the following tokens:

1. checkboxBackgroundColor – This changes the background color of the Checkbox.
2. checkboxBorderColor – This changes the border color of the Checkbox.
3. checkmarkColor – This changes the color of Checkmark.
4. borderRadius - This changes the border radius of the Checkbox (use this to create a circular checkbox)

## Token Usage Example:

Circular Checkbox: We use "borderRadius=7" right now because we currently don't support % for borderRadius. The checkbox
size is currently 14x14, so 7 is 50%. We have a task to allow for %'s.

```
const CircularCheckbox = Checkbox.customize({ tokens: { borderRadius: 7 } });
```

Checkbox with white background (when unchecked):

```
const WhiteCheckbox = Checkbox.customize({ tokens: { backgroundColor: 'white' } });
```

Circular Color-Customized Checkbox - (Green background + green border + white checkmark) when Checked.

```
const CircleColorCheckbox = Checkbox.customize({
  tokens: { borderRadius: 7 },
  _overrides: {
    checked: {
      tokens: {
        checkboxBackgroundColor: 'green',
        checkboxBorderColor: 'green',
        checkmarkColor: 'white'
      }
    },
    focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
    hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
    pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } }
  }
});
```
