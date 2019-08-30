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

Components should have the capability to have `IComponentTokenDefinitions<TProps, TTheme>` applied to them.

- These should be set at the time when a component is defined
- These should not change over the lifetime of a component
- `TProps` refers to the input properties (or customizeable properties) of a component
- `TTheme` refers to the theme definition for your framework

So as an example your configuration object might look like this:

    interface IComponentOptions<TProps> {
      baseSettings?: ...
      tokens?: IComponentTokenDefinitions<TProps, ITheme>;
      slots?: ...
    }

When the component is created the `IComponentTokenDefinitions<TProps, TTheme>` need to be resolved into `IComponentTokens<TProps, TTheme>`. This happens by calling:

    export function buildComponentTokens<TProps, TTheme>(
      entries: ITokenInputEntry<TProps, TTheme>[],
      hasToken?: ITargetHasToken
    ): IComponentTokens<TProps, TTheme> {

This will turn the entries into an array of processor functions that are ready to render and build up the merged list of all token props for this component. While processor functions will be in the resulting tokens as-is, `ITokenOperations` will be merged into processor functions. Each `ITokenOperation` will do the following:

1. Go through each slot targeted in the operation
1. Go through each token operation for that slot
1. See if that token is supported on that slot by the `hasToken` callback
1. If the token is supported set it up to transfer to the tokens, otherwise set it up to build a style

Order will be maintained such that operations will run in the order they are declared in the token definitions.

### Component Render Time

At render time the library should call:

    export function processTokens<TProps, TTheme>(
      props: TProps,
      theme: TTheme,
      slotProps: IComponentSettings,
      tokenInfo: IComponentTokens<TProps, TTheme>,
      baseCacheKey: string,
      cache: object
    ): ISlotProps {

This will take the base settings (`slotProps`) and the user props (`props`) and run through the resolved tokens for the component (`tokenInfo`). This will first generate keys for the tokens to see if it is already present in the cache, otherwise it will be added to the cache so it will be found in subsequent calls.

Note that the `baseCacheKey` will be prepended to the cache key the token processor generates. This `baseCacheKey` should have a one to one mapping with the `slotProps` passed in, such that the merge of these two is represented by the key. This is all to say that:

- If the `baseCacheKey` is the same, the `slotProps` should be equal. Failure here would break caching.
- If the `baseCacheKey` is different, `slotProps` should be a different object. Failure to do this would add inefficiency.

## Standard Token Authors

## Component Authors

When standing up a new component
