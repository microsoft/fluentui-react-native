import { ISlotProps } from '@uifabric/theme-settings';

/**
 * a list of slots to transfer to rather than generate styles for, this delegates style creation
 * to the sub-object rather than the parent.
 */
export interface ITransferMask {
  [key: string]: boolean;
}

export type ITargetHasTokens = (target: string, keys: string[]) => boolean;

/**
 * A converter function which turns token properties into a style fragment
 * @param tokenProps - the set of props which include the token values (if set)
 * @param theme - the current theme for this component
 * @param targets - one or more slots to target
 */
export type ITokenFunction<TProps extends object, TTheme = object> = (
  tokenProps: TProps,
  theme: TTheme,
  targetSlots: string[]
) => ISlotProps | undefined;

/**
 * Additional data attached to a token function
 */
export interface ITokenFunctionData<TProps extends object> {
  /**
   * tokens processed by this function, used to build cache keys for memoization of results
   */
  _keys: (keyof TProps)[];

  /**
   * if true just transfer the tokens if the target is a known component.  This delegates style creation to the
   * sub-component.
   * Example:
   *  color values or other standard values can be transferred.
   *  a split button mode token only applies to split buttons and should not transfer.
   */
  _allowTransfer?: boolean;
}

/**
 * This attaches the list of keys to the processor function for the cases where they are needed
 */
export type ITokenProcessor<TProps extends object, TTheme = object> = ITokenFunction<TProps, TTheme> & ITokenFunctionData<TProps>;

/**
 * An entry in a component definition for processing a given set of tokens
 */
export interface ITokenEntry<TProps extends object = object, TTheme = object> {
  /** function which takes token props and produces styles */
  processor: ITokenProcessor<TProps, TTheme>;

  /** targets to produce styles for */
  targetSlots: string[];
}

/**
 * A map of source to targets for transfers which involve renaming
 */
export interface ITokenTransferMapping {
  source: string;
  target: string;
}

/**
 * Type of a transfer entry, if just a string it is equivalent to source === target
 */
export type ITokenTransferEntry = string | ITokenTransferMapping;

/**
 * The list of tokens to transfer to sub components
 */
export interface ITokenTransferSet {
  [key: string]: ITokenTransferEntry[];
}

/**
 * Fragment of a component that is ready to process tokens
 */
export interface IResolvedComponentTokenInfo {
  tokens: ITokenEntry[];
  tokenKeys: Map<string, boolean>;
  transfer: ITokenTransferSet;
}
