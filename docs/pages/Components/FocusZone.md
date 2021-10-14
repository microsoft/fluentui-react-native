# Component Name: FocusZone

## Purpose:

FocusZone abstracts arrow key navigation behaviors. It takes keyboarding patterns that are seen in
common controls, such as RadioGroup and Lists, and creates a wrapper control that can be shared in a reusable fashion.
These patterns may include navigating a RadioGroup in a circular fashion, or disallowing tabbing through elements of a list.

## Don't:

- There is no integration for nested FocusZone's - trying to do this will cause unwanted behavior.

## Sample Code:

```
<FocusZone isCircularNavigation={true} focusZoneDirection="bidirectional">
  <Checkbox label="Option A" />
  <Checkbox label="Option B" />
  <Checkbox label="Option C" />
  <Checkbox label="Option D" />
</FocusZone>
```

## Props:

| Prop                   | Type                                                                                                                             | Default Value                    | Description                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| focusZoneDirection     | [FousZoneDirection](https://github.com/microsoft/fluentui-react-native/new/master/docs/pages/Components#focuszonedirection-type) | FocusZoneDirection.bidirectional | Defines which arrows to respond to.                                                                                                                                               |
| disabled               | boolean                                                                                                                          | false                            | If set, the FocusZone will not be tabbable and keyboard navigation will be disabled.                                                                                              |
| isCircularNavigation   | boolean                                                                                                                          | false                            | If set, when navigating next from the last element, focus will circle back to the first. And vice versa.                                                                          |
| defaultTabbableElement | React.RefObject<React.Component>                                                                                                 | none                             | Optionally defined the initial tabbable element inside the FocusZone. If set, when navigating to the FocusZone, focus wil land on this element.                                   |
| use2DNavigation        | boolean                                                                                                                          | false                            | Allows for 2D navigation. This navigation strategy takes into account the position of elements on screen, and navigates in the direction the user selects to the nearest element. |
| onFocus()              | (e?: any) => void;                                                                                                               | None                             | Callback called when “focus” event triggered in FocusZone                                                                                                                         |
| componentRef           | React.RefObject<IFocusable>;                                                                                                     | None                             | A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.                                                            |

### FocusZoneDirection Type

| Name          | Description                        |
| ------------- | ---------------------------------- |
| bidirectional | Responds to all arrows.            |
| vertical      | Only respons to up/down arrows.    |
| horizontal    | Only respons to right/left arrows. |
| none          | Doesn't respond to any arrows.     |
