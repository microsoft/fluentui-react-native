# Composable Component Pattern

This package establishes a pattern for compressing unnecessary layers in the component tree. This allows higher order components which are consuming other components to use the processing logic of embedded controls and then render them using their constituent parts.

React defines a simplest component as a render function which takes props. This package splits that into three parts. A processor for properties, a set of slots of child components, and a render function.

As a result if there is a Stack component built, which internally wraps a View, this component will not add a stack entry in the tree when used in a HOC, it will run as a processor and then directly emit the View with decorated props.

## Base Types

### IGenericProps

This can be any props interface. For purposes of this module it is defined as having an optional children entry which is the only thing IComposable will access directly.

### ISlotProps

This is a collection of props in the form of:

    interface ISlotProps {
      root: IGenericProps;
      [key: string]: IGenericProps;
    }

These correspond to the props to pass to the matching slots for the component.

### IProcessResult

As the process functionality runs it will use this as a payload to pass through the routines. It is defined as follows:

    type IProcessResult = {
      props?: IGenericProps;
      slotProps?: ISlotProps;
    } & TAdditional;

The TAdditional is a payload attached to the object that will get passed through, eventually to render. This allows components to pass custom data, such as the results of hook processing, to their render function.

### IResolvedSlot

This is what is passed to the render function. It augments the IProcessResult and adds a reference to IComposable as well as a set of resolved slots for the sub-components.

## IComposable

This is the pattern used to wrap a component. This can either wrap stock components or components defined using the compose pattern.

### useProcessProps

This is the property processor, named with a use in the title to denote the ability to contain hooks. It takes props, a theme object, and produces a process result object.

`useProcessProps: (props: IGenericProps, theme: object) => IProcessResult`

The processor for a component should fill in the input prop data for its sub-components. These props set by the containing component will be passed as input properties to the child components and the process can repeat.

### render

`render: (propInfo: IProcessResult, ...children: React.ReactNode[]) => JSX.Element | null`

The render function does the rendering for the component. Note that to have unnecessary layers skipped, component authors should use the `renderSlot` helper function. The JSX syntax is syntactic sugar for `React.createElement` which will create an entry in the component tree with the expected DOM diffing and everything else.

Fabric-web uses a `withSlots` JSX helper which is an option if we want that functionality. The trick here is that the slots to be called need to be in function component form which means that they need to be wrapped in a closure for each slot. Right now this isn't present in this package but could be added in the future.

### slots

`slots?: { [key: string]: IComposable }`

The slots are the child IComposable components, which can either be complex components or wrapped controls which do not internally support this pattern.

## Other APIs

### renderSlot

This is a helper function which takes an IResolvedSlot as input as well as a set of children and does the rendering. This will call `createElement` if necessary or make the direct calls depending on the nature of the slot. The props information will already be attached to the resolved slot which is why children are the only input.

### wrapStockComponent

This takes a non-composable component and wraps it in an IComposable. Ideally this should be called when the parent component type itself is being set up so that it doesn't recreate on every instance.
