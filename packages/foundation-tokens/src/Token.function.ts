import { ITokenProcessor, ITokenFunction } from './Token.types';
import { ISlotProps } from '@uifabric/theme-settings';
import { ITokenProcessorDefinitionEntry } from './Token.function.types';

/**
 * Convenience helper to make it easy to configure token processors
 *
 * @param fn - function that will be decorated with the keys and allow transfer settings
 * @param keys - keys for this token processor
 * @param allowTransfer - whether the keys can be transferred
 */
export function setupTokenProcessor<TProps extends object, TTheme = object>(
  fn: ITokenFunction<TProps, TTheme>,
  keys: (keyof TProps)[],
  allowTransfer?: boolean
): ITokenProcessor<TProps, TTheme> {
  const processor = fn as ITokenProcessor<TProps, TTheme>;
  processor._keys = keys;
  processor._allowTransfer = allowTransfer;
  return processor;
}

/**
 * If the token is specified, set the value in the style to either a value from the theme (if
 * we were able to use the token value as a key), or the token value itself
 *
 * @param tokens - token props to source the token from
 * @param src - source key name to use for lookups
 * @param target - target key name, to use for writing to the style
 * @param lookup - object to attempt to lookup the value in
 * @param style - style to write the value to (if the token was specified)
 */
export function lookupToken(tokens: object, src: string, target: string, lookup: object, style: object): void {
  if (tokens.hasOwnProperty(src)) {
    const val = tokens[src];
    style[target] = typeof val === 'string' && lookup.hasOwnProperty(val) ? lookup[val] : val;
  }
}

/**
 * Build the slot props to return from a token processor
 *
 * @param style - style that has been produced by this token processor
 * @param targets - target slots that will receive this style
 */
export function buildSlotPropsFromStyle(style: object, targets: string[]): ISlotProps | undefined {
  if (Object.keys(style).length > 0) {
    const result = {};
    const propsForEachSlot = { style };
    for (const target of targets) {
      result[target] = propsForEachSlot;
    }
    return result as ISlotProps;
  }
  return undefined;
}

/**
 * Helper for easy token processor building.  This handles tokens that need to be looked up in
 * the theme or just copied directly to a style.
 *
 * @param entries - definition of how this token should be handled
 */
export function defineTokenProcessor<TProps extends object, TTheme>(
  entries: ITokenProcessorDefinitionEntry<TProps, TTheme>[]
): ITokenProcessor<TProps, TTheme> {
  return setupTokenProcessor<TProps, TTheme>(
    (props: TProps, theme: TTheme, targets: string[]) => {
      const style = {};
      for (const entry of entries) {
        const { key, lookup } = entry;
        const target = entry.target || key;
        if (lookup) {
          lookupToken(props, key as string, target as string, lookup(theme), style);
        } else if (props.hasOwnProperty(key)) {
          style[target as string] = props[key];
        }
      }
      return buildSlotPropsFromStyle(style, targets);
    },
    entries.map(entry => entry.key),
    true
  );
}
