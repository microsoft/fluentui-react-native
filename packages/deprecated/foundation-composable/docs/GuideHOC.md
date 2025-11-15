# Getting Started - Writing a Complex Component

Now let's look at how to write a complex or higher order component using the composable framework. In this case we're going to build a button control that has an icon, text, or both. This will be built out of parts for clarity rather than simply wrapping a primitive button component.

This will also start out as unopinionated, similar to the way we approached the previous example.

## Unopinionated Functional Button

Let's start with a simple button interface.

```ts
export interface IButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
  icon?: string;
}
```

This adds a disabled property, a click handler, and properties to specify the button label value and icon name. A base implementation might look something like:

We will also define a ISlotProps interface for button so store collections of properties that correspond to the parts of the component.

```ts
export interface IButtonSlotProps {
  root: IButtonProps;
  icon: IIconProps;
  label: ITextProps;
}
```

With this in place let's look at the base button implementation.

```tsx
const ButtonBase: React.FunctionComponent<IButtonProps> = (props: IButtonProps) => {
  const { disabled, children, icon, label, ...rootProps } = props;
  // add click handlers, onClick callback implementation, etc.
  const interactiveSlotProps = useAddButtonInteractiveProps(disabled, rootProps);
  // setup the correct accessibility props for a core button
  const ariaSlotProps = useAddButtonAriaProps(disabled, label, icon, rootProps);
  // merge props together
  const mergedProps: IButtonSlotProps = mergeSettings(interactiveSlotProps, ariaSlotProps, { root: rootProps });

  return (
    <View {...mergedProps.root}>
      {icon && <Icon {...mergedProps.icon} />}
      {label && <Text {...mergedProps.label}>{label}</Text>}
      {children}
    </View>
  );
};
```

This creates a base component that will be configured as a button, set the requisite aria props to make it behave like a button in the accessibility tree, then renders the contents as appropriate using the merged slotProps.

### Adding Styling

Adding styling to this component is problematic as it encapsulates multiple controls. While a css class or inline style could be set on the outer component, reaching the inner components requires adding an injection pattern. Some potential patterns might include:

- Allowing a collection of inline styles to be passed through props.
- Creating a way to pass class names to sub-components.
- Allow passing an injection function that can inject class names or inline styling.

We'll use the `useStyling` pattern established by composable to add style injection here. This function will return `IButtonSlotProps` which can include class names, inline styles, or both.

```tsx
export interface IStyleableButtonProps extends IButtonProps {
  useStyling?: (props: IButtonProps) => IButtonSlotProps;
}

const ButtonBase: React.FunctionComponent<IStyleableButtonProps> = (props: IStyleableButtonProps) => {
  const { disabled, children, icon, label, useStyling, ...rootProps } = props;
  // inject styles
  const styledProps = useStyling && useStyling(rootProps);
  // add click handlers, onClick callback implementation, etc.
  const interactiveSlotProps = useAddButtonInteractiveProps(disabled, rootProps);
  // setup the correct accessibility props for a core button
  const ariaSlotProps = useAddButtonAriaProps(disabled, label, icon, rootProps);
  // merge props together
  const slotProps = mergeSettings(styledProps, interactiveSlotProps, ariaSlotProps, { root: rootProps });

  return (
    <View {...slotProps.root}>
      {icon && <Icon {...slotProps.icon} source={icon} />}
      {label && <Text {...slotProps.label}>{label}</Text>}
      {children}
    </View>
  );
};

const Button: React.FunctionComponent<IButtonProps> = (props: IButtonProps) => {
  const useStyling = (props: IButtonProps) => {
    // return whatever styles are desired for the button
  };
  return <ButtonBase useStyling={useStyling} {...props} />;
};
```

This does the job though it does have the side effect of adding an extra layer in the component hierarchy for each Button rendered. The extra layer could be removed by calling the button base as a function directly:

```ts
return ButtonBase({ useStyling, ...props });
```

Because of the way hooks are handled however this pattern can be dangerous if there is any conditional logic that would change whether or not that component would be rendered. This might also trigger warnings about violating the rule of hooks. The call to `createElement` effectively sets up a stack frame that hooks are associated with. Bypassing this will append the hooks to the current component's frame and requires order be strictly followed.

This is one of the reason composable formalizes the hook vs. render pattern, it creates a formal pattern for running all hooks in a hierarchy, even if rendering ends up being conditional.

## ButtonBase & Button using composable

Here we will use the same interfaces and helpers but implement `ButtonBase` and `Button` using composable.

We will use the optional TState to pass additional arguments between `usePrepareProps` and `render`. Note that the state can be anything, it is simply a payload to be passed from one function to the next.

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */

export interface IButtonState {
  disabled?: boolean;
  icon?: string;
  label?: string;
}

const ButtonBase = composable<IButtonProps, IButtonSlotProps, IButtonState>({
  usePrepareProps: (props: IButtonProps, useStyling: IUseStyling<IButtonSlotProps>) => {
    const { disabled, icon, label, ...rootProps } = props;
    const styledProps = useStyling(props);
    const interactiveSlotProps = useAddButtonInteractiveProps(disabled, rootProps);
    const ariaSlotProps = useAddButtonAriaProps(disabled, label, icon, rootProps);
    const slotProps = mergeSettings(styledProps, interactiveSlotProps, ariaSlotProps, { root: rootProps });
    return { slotProps, state: { icon, label, disabled } };
  },
  render: (Slots: ISlots<IButtonSlotProps>, renderData: IRenderData<IButtonSlotProps, IButtonState>, ...children) => {
    const { icon, label } = renderData.state;
    <Slots.root>
      {icon && <Slots.icon source={icon} />}
      {label && <Slots.label>{label}</Slots.label>}
      {children}
    </Slots.root>;
  },
  slots: {
    root: { slotType: View },
    icon: { slotType: Icon },
    label: { slotType: Text },
  },
});

const Button = composable({
  ...ButtonBase.__composable,
  useStyling: (props: IButtonProps) => {
    // return whatever styles are desired for the button
  },
});
```

The actual implementation code is very much the same between the purely functional implementation and the composable implementation. The differences are:

- The implementation is broken into separate `usePrepareProps` and `render` functions
- `icon` and `label` are passed to `render` via the `renderData.state` object.
- The `render` function uses `Slots` to actually render the components. These objects already embed the information from the `renderData.slotProps`.

### Possibilities for customization

While the composable pattern formalizes the method of injecting styling, this actually allows for a great deal of additional customization.

Some examples might include:

#### Swapping out a slot

In this case the icon slot is switched from using `Icon` to `CustomIcon`. This also updates the props interface to reflect the new call signature.

```ts
export interface IButtonWithCustomIconProps extends Omit<IButtonProps, 'icon'> {
  icon?: ICustomIconProps['source'];
}

const ButtonWithCustomIcon = composable<IButtonWithCustomIconProps>(
  immutableMerge(ButtonBase.__composable, {
    slots: {
      icon: { slotType: CustomIcon },
    },
  }),
);
```

#### Adding additional property logic

Composing a composable control allows swapping out any piece including the `usePrepareProps` function. If desired the version from the parent control can be called as if this control were being subclassed.

```ts
const ButtonWithLogic = composable<IButtonProps>({
  ...ButtonBase.__composable,
  usePrepareProps: (props, useStyling) => {
    const parentRenderData = ButtonBase.__composable.usePrepareProps(props, useStyling);
    const slotProps = doExtraPropManipulation(parentRenderData.slotProps);
    return { slotProps, state: parentRenderData.state };
  },
});
```

#### Changing the render order

This is a bit contrived, but if the icon and text should be reordered this can be accomplished by replacing `render`

```tsx
const Nottub = composable<IButtonProps>({
  ...ButtonBase.__composable,
  render: (Slots, renderData, ...children) => {
    const { icon, label } = renderData.state;
    <Slots.root>
      {label && <Slots.label>{label}</Slots.label>}
      {icon && <Slots.icon source={icon} />}
      {children}
    </Slots.root>;
  },
});
```
