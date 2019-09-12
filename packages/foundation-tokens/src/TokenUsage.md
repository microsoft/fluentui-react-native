# Token Usage Guide

The foundation-tokens package is designed to be theme and framework agnostic library for turning tokens into styles, with the ability to add extensions such as looking styles up in the theme. This does require that the library uses the concepts of slotProps

`ISlotProps` and `IComponentSettings` are defined in the settings library but can be used minimally as a collection of props corresponding to the parts of a component. The root part is always assumed to be under a sub-object called root. So the structure might look like:

    {
      root?: IMyComponentProps;
      slot1?: IMySubComponentProps;
    }

The term **slots** refers to the name of the part of a component.

## Component Framework Authors

To add token processing capabilities to your component libraries these are the steps to follow:

### Component Creation Time

Component slots should have the capability to have `ISlotStyleFactories<TProps, TTheme>` applied to them.

- These should be set at the time when a component is defined
- These should not change over the lifetime of a component
- `TProps` refers to the input properties (or customizeable properties) of a component
- `TTheme` refers to the theme definition for your framework

So as an example your configuration object might look like this:

    interface IComponentOptions<TProps> {
      baseSettings?: ...
      slots?: IStyleFactories<TProps, ITheme>;
            --- OR ---
      slots?: { [key: string]: { /* some members */ } & ISlotStyleFactories<TProps, TTheme> }
    }

When the component is created the set of `ISlotStyleFactories<TProps, TTheme>` need to be resolved into `IComponentTokens<TProps, TTheme>`. This happens by calling:

    export function buildComponentTokens<TProps, TTheme>(
      entries: IStyleFactories<TProps, TTheme>,
      hasToken?: ITargetHasToken,
      finalizer? IStyleFinalizer<TProps, TTheme>
    ): IComponentTokens<TProps, TTheme> {

The `IStyleFactoryOperation<TProps, TTheme>` entries will be processed into arrays targeting slots and tokens of the component, while any entires that are of type `IStyleFactoryFunction<TProps, TTheme>` will be put in a separate list that will be run at the end.

For the operations, they will execute as follows:

1. Go through each slot targeted in the operation
1. Go through each token operation for that slot
1. See if that token is supported on that slot by the `hasToken` callback
1. If the token is supported set it up to transfer to the tokens, otherwise set it up to build a style

Order will be maintained such that operations will run in the order they are declared in the token definitions. Any functions will be run at the end.

#### IStyleFinalizer

`buildComponentTokens` can optionally accept a `IStyleFinalizer`. This is a processor that will run on a style before it is cached. This allows for custom integration with a styling system. A web version might create CSS rules with the style, remove the style objects, then add class names to the props.

### Component Render Time

At render time the library should call:

    export function processTokens<TProps, TTheme>(
      props: TProps,
      theme: TTheme,
      slotProps: IComponentSettings,
      tokenInfo: IComponentTokens<TProps, TTheme>,
      prefix: string,
      cache: object,
      displayName?: string
    ): ISlotProps {

This will take the base settings (`slotProps`) and the user props (`props`) and run through the resolved tokens for the component (`tokenInfo`). This will first generate keys for the tokens to see if it is already present in the cache, otherwise it will be added to the cache so it will be found in subsequent calls.

Note that the `prefix` will be prepended to the cache key the token processor generates. This `prefix` should have a one to one mapping with the `slotProps` passed in, such that the merge of these two is represented by the key.

#### Caching

Props and styles for a given slot are cached in the cache on a per slot basis. The returned slotProps will be a new object but the props within will often be shared. This allows the caches for each slot to be invalidated on a one to one basis. If a foreground color is changed, a sub-component that does not pull from foreground color will not have its style changed.

## Standard Token Authors

Token interfaces can often be shared across components, and the actions that need to be taken on those tokens will be consistent from the perspective of a given slot. As a result tokens can be specified in parts. These parts are defined using the `IOperationSet<TProps, TTheme>` interface. This is an array of:

    export interface IStyleFactoryOperation<TProps, TTheme> {
      source: keyof TProps;
      target?: string;
      lookup?: ILookupThemePart<TTheme>;
    }

The values are used as follows:

- `source` - the token key that is set on the token props interface
- `target` - optional name for the target style or token. If this is empty it is assumed that `source === target`
- `lookup` - a function to look up an object in the theme. If the value of this property is a string type, this value will be looked up in this theme object and replaced if it exists. If this is undefined this behavior will be skipped.

These token operations will be automatically processed when components are defined and merged into a custom processor function for this component.

## Component Authors

If the component framework has integrated the token package, there should be a configuration setting that allows for specifying a list of tokens to add.

### Using standard style operations

Standard tokens can be added by referencing `IOperationSet` arrays. In the slot definitions the styleFactories can refer to these sets as follows:

    slots: {
      root: {
        styleFactories: [backgroundColorTokens, borderTokens]
      },
      content: {
        styleFactories: [foregroundColorTokens]
      }
    }

Each slot is defining what values it is pulling from the root props and settings. Note that root props can be propogated to multiple slots. This does not have to be 1 to 1.

### Using custom style functions

The `styleFactories` array can accept an `IStyleFunction` as an input as well. This is a processing function which also defines the keys it depends on. The `styleFunction` utility is provided to make these easy to create. Usage would be as follows:

    const myTokenProcessor = styleFunction<IMyProps, ITheme>(
      (props: IMyProps, theme: ITheme) => {
        return {
          style: {
            color: props.isMode1 ? theme.palette.buttonText : theme.palette.windowText
            borderWidth: props.borderless ? 0 : 1
          }
        }
      },
      ['isModel', 'borderless']
    );

    // in the component definition just mix them in with the operation sets
    slots: {
      root: {
        styleFactories: [backgroundColorTokens, myTokenProcessor]
      }
    }

Note that style functions run after the operations run and the results will be mixed together with higher precedence. This means that if a value is set by both a style function and an operation the style function will overwrite the value.
