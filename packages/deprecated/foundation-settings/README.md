# Theme Settings

Theme settings represent the configuration data for a component and can be used for both simple components as well as higher order components. There are a few main concepts that get combined in this package.

## ISlotProps

    export interface ISlotProps<TProps extends object = object> {
      root: TProps;
    }

Slot props or `ISlotProps` represent one or more sets of properties that correspond to the parts of a component. The pattern establishes that there must be an entry called root for the main component, then there can be additional named components. Consider the following two examples:

### Simple Label Example

In react.js, this might be a `div` wrapping a string, in native it might wrap the native text control. Let's consider the native scenario where simple label adds a labelStyle prop to the base text control. The interface and slot props might look as follows:

    interface ISimpleLabelProps extends TextProps {
      labelStyle?: string;
    }

    interface ISimpleLabelSlotProps {
      root: ISimpleLabelProps;
    }

### Two Line Button Example

As a second example consider a button that has two lines of text. The structure of the button will have an outer container and then two simple label controls arranged vertically. In this case the control has three slots: the outer container, and the two labels. The props and slot props might look as follows:

    interface ITwoLineButtonProps extends ViewProps {
      topText: string;
      bottomText: string;
    }

    interface ITwoLineButtonSlotProps {
      root: ITwoLineButtonProps;
      topText: ISimpleLabelProps;
      bottomText: ISimpleLabelProps;
    }

### Why the Slot Props Pattern?

The slot props pattern was chosen for a number of reasons.

- It creates a standard way of handling strongly typed named collections of props.
- It allows framework code to process both simple and higher order components without special casing.
- It allows the sub-objects, including root, to be passed directly to components as props without needing to strip values.
- It is agnostic to what is in each entry, avoiding name collisions.

## IComponentSettings

The IComponentSettings interface is an extension of ISlotProps which is designed to allow authoring settings for a component. It has the following form:

    export type IComponentSettings<TSlotProps extends ISlotProps = ISlotProps> =
      IPartialSlotProps<TSlotProps> & {
        _parent?: string | string[];
        _precedence?: string[];
        _overrides?: {
          [key: string]: IComponentSettings<TSlotProps>
        };
      };

### Partial ISlotProps

Props interfaces have a mix of required and optional parameters. When defining settings in places such as theme definitions this is not desireable as those values will need to be filled from the actual props passed into the component. As a result `IComponentSettings<IMySlotProps>` will make the slot props into a partial object.

### \_overrides and \_precedence

The overrides define recursive IComponentSettings that will be applied to the root in the order defined by \_precedence. These will be merged one by one, supplanting values at the root level and potentially supplying additional overrides.

For the simple label example above this might work as follows:

    const labelSettings: IComponentSettings<ISimpleLabelSlotProps> = {
      root: {
        style: { color: 'black' }
      },
      _precedence: ['primary', 'hovered', 'disabled'],
      _overrides: {
        disabled: { root: { style: { color: '#a3a3a3' } } },
        hovered: { root: { style: { color: '#c2c2c2' } } },
        primary: {
          root: { style: { color: 'white' } },
          _overrides: {
            disabled: { root: { style: { color: '#1d1d1d' } } },
            hovered: { root: { style: { color: 'white' } } }
          }
        }
      }
    }

The resulting color value would be:

- _no overrides_ - black
- _disabled_ - #a3a3a3
- _hovered_ - #c2c2c2
- _primary_ - white
- _primary disabled_ - #1d1d1d
- _primary hovered_ - white
- _primary disabled hovered_ - #1d1d1d

The ability to mix in layers of overrides in a recursive manner allows the overrides to be used to provide both alternate styles and states for a component.

## Styling

Style handling is described in [Styles.md](./Styles.md)
