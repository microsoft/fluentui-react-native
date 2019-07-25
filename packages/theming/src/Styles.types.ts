import { ITheme } from './Theme.types';

/**
 * function prototype for finalizing a matching key of a style
 * @param theme - currently active theme, used for lookups of semantic values
 * @param source - style to finalize values from
 * @param key - key being processed, this value should exist in the style
 * @param target - target object to output the modified style to, this might be source but might not
 */
export type IStyleValueFinalizer = (theme: ITheme, source: object, key: string, target: object) => void;

export interface IStyleValueFinalizers {
  [key: string]: IStyleValueFinalizer;
}

/**
 * a type for clients to use to register a set of finalizers for a given style fragment
 */
export type IStyleSetFinalizers<TStyleFragment> = { [P in keyof TStyleFragment]: IStyleValueFinalizer };
