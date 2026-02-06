# Component Name: RadioGroup

## Purpose

The goal of this RadioGroup component is to let users select one option from two or more choices. Each option is represented by one RadioButton component, and the group of RadioButton’s is represented by a RadioGroup component. A user can only select one RadioButton in a RadioGroup.

## Do's:

- Use when there are 2-7 options, if you have enough screen space and the options are important enough to be a good use of that screen space. Otherwise, use a Checkbox or Dropdown list.
- Use on wizard pages to make the alternatives clear, even if a Checkbox is otherwise acceptable.
- List the options in a logical order, such as most likely to be selected least, simplest operation to most complex, or least risk to most. Alphabetical ordering is not recommended because it is language dependent and therefore not localizable.
- If none of the options is a valid choice, add another option to reflect this choice, such as “None” or “Does not apply”.
- Select the safest (to prevent loss of data or system access) and most secure and private option as the default. If safety and security aren’t factors, select the most likely or convenient option.
- Align radio buttons vertically instead of horizontally, if possible. Horizontal alignment is harder to read and localize.

## Don't:

- Use when the options are numbers that have fixed steps, like 10, 20, 30. Use a slider component instead.
- Use if there are more than 7 options, use a Dropdown instead.
- Nest with other RadioGroup or Checkboxes. If possible, keep all the options at the same level.

## Sample Code:

```jsx
<RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A">
  <RadioButton content="Option A" buttonKey="A" />
  <RadioButton content="Option B" buttonKey="B" />
  <RadioButton content="Option C" buttonKey="C" disabled={true} />
  <RadioButton content="Option D" buttonKey="D" />
</RadioGroup>
```

## Props

### RadioGroup Component:

| Prop               | Type                  | Default Value | Description                                                                                                                                                                                                                                    |
| ------------------ | --------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| label              | string                |               | Descriptive label for the RadioGroup. This will be displayed as the title of the radio group to the user.                                                                                                                                      |
| defaultSelectedKey | string                |               | The key of the RadioButton that will initially be selected.                                                                                                                                                                                    |
| accessibilityLabel | string                |               | An accessibility label for screen readers. If not provided, it will be set to the label of the radio group.                                                                                                                                    |
| selectedKey        | string                |               | The key of the selected option. If you provide this, you must maintain selection state by onChange events and passing a new value in when changed. This overrides and makes the RadioGroup a controlled component.defaultSelectedKey observing |
| onChange           | (key: string) => void |               | Callback for receiving a notification when the choice has been changed.                                                                                                                                                                        |

### RadioButton Component:

| Prop                  | Type                          | Default Value | Description                                                                                                                                                                                                                                                                                                  |
| --------------------- | ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| content               | string                        |               | The text string for the option.                                                                                                                                                                                                                                                                              |
| buttonKey             | string                        |               | A unique key-identifier for each option.                                                                                                                                                                                                                                                                     |
| disabled              | boolean                       |               | Whether or not the radio button is selectable.                                                                                                                                                                                                                                                               |
| accessibilityPosInSet | number                        |               | Defines the current radio button's position in the radio group for accessibility purposes. This value is auto-generated iff RadioButtons are direct children of RadioGroup. Otherwise, it can be used to set the n-of-m values.                                                                              |
| accessibilitySetSize  | number                        |               | Defines the number of radio buttons in the group for accessibility purposes. Defines the current radio button's position in the radio group for accessibility purposes. This value is auto-generated iff RadioButtons are direct children of RadioGroup. Otherwise, it can be used to set the n-of-m values. |
| accessibilityLabel    | string                        |               | An accessibility label for screen readers. If not provided, it will be set to the label of the radio button's content.                                                                                                                                                                                       |
| componentRef          | `React.RefObject<IFocusable>` |               | A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.                                                                                                                                                                                       |

## RadioGroup Tokens

`interface IRadioGroupTokens extends IForegroundColorTokens, FontTokens {}`

## RadioButton Tokens

`interface IRadioButtonTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {}`

| Prop            | Type   | Default Value | Description              |
| --------------- | ------ | ------------- | ------------------------ |
| textBorderColor | string |               | Specifies the text color |
