import type {
  LookupThemePart,
  OperationSet,
  StyleFactoryFunction,
  StyleFactoryFunctionRaw,
  StyleFactoryOperation,
} from '@fluentui-react-native/tokens';

import type { ICachedPropHandlers } from './Token.internal';

export type ILookupThemePart<TTheme> = LookupThemePart<TTheme>;
export type IStyleFactoryOperation<TTokens, TTheme> = StyleFactoryOperation<TTokens, TTheme>;
export type IOperationSet<TTokens, TTheme> = OperationSet<TTokens, TTheme>;
export type IStyleFactoryFunctionRaw<TProps, TTokens, TTheme> = StyleFactoryFunctionRaw<TProps, TTokens, TTheme>;
export type IStyleFactoryFunction<TProps, TTokens, TTheme> = StyleFactoryFunction<TProps, TTokens, TTheme>;

/**
 * An entry can be an individual operation, an array of operations, or a token function
 */
export type IStyleFactoryEntry<TProps, TTokens, TTheme> =
  | IStyleFactoryOperation<TTokens, TTheme>
  | IOperationSet<TTokens, TTheme>
  | IStyleFactoryFunction<TProps, TTokens, TTheme>;

/**
 * This is the collection of style factories corresponding to the slots
 */
export type IStyleFactories<TSlotProps extends object, TTokens, TTheme> = {
  [K in keyof TSlotProps]?: IStyleFactoryEntry<TSlotProps[K], TTokens, TTheme> | IStyleFactoryEntry<TSlotProps[K], TTokens, TTheme>[];
};

/**
 * Callback function for a component to allow querying whether a given token is supported on a sub-component.  In
 * the case of token operations if a sub-component supports this token value it will be transferred to that component
 * rather than built into a style
 */
export type ITargetHasToken = (target: string, key: string) => boolean;

/**
 * Style finalizer function.  Allows transforming props and styles before they are cached.  This could be used
 * to create css rules for the styles and changing the reference to be by class name
 */
export type IStyleFinalizer<TProps> = (props: TProps, slotName: string) => TProps;

/**
 * Resolved token definitions, ready to be rendered
 */
export interface IComponentTokens<TSlotProps extends object, TTokens, TTheme> {
  /** handlers to process the props of each slot */
  handlers: ICachedPropHandlers<TSlotProps, TTokens, TTheme>;

  /** token keys put into a map for both ordered retrieval and quick lookups */
  tokenKeys: { [key: string]: undefined };
}
