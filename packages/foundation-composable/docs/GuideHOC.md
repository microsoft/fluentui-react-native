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

This adds a disabled property, a click handler, and properties to specify the button label value and icon name. A simple implementation might look something like:

```tsx
const ButtonBase: React.FunctionComponent<IButtonProps> = (props: IButtonProps) => {
  const { children, icon, label, ...rootProps } = props;
  return (
    <View {...rootProps}>
      {icon && <Icon />}
      {label && <Text>{label}</Text>}
      {children}
    </View>
  );
};
```
