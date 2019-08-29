import { IComponentSettings } from '@uifabric/theme-settings';
import { ITargetHasToken, ITokenInputEntry, ITokenKeyLogic, IComponentTokens, ITokenFunction, ITokenProcessor } from './Token.types';

interface ITokenKeySet<TProps, TTheme> {
  mapping: ITokenKeyLogic<TProps, TTheme>[];
  slots: string[];
}

interface ITokensForSlot<TProps, TTheme> {
  toStyle: ITokenKeyLogic<TProps, TTheme>[];
  toTokens: ITokenKeyLogic<TProps, TTheme>[];
}

interface IResolvedTokenMappings<TProps, TTheme> {
  [slot: string]: ITokensForSlot<TProps, TTheme>;
}

/**
 * Convenience helper to make it easy to configure token processors
 *
 * @param fn - function that will be decorated with the keys and allow transfer settings
 * @param keys - keys for this token processor
 * @param allowTransfer - whether the keys can be transferred
 */
export function setupTokenProcessor<TProps, TTheme = object>(
  fn: ITokenFunction<TProps, TTheme>,
  keys: (keyof TProps)[]
): ITokenProcessor<TProps, TTheme> {
  const processor = fn as ITokenProcessor<TProps, TTheme>;
  processor._keys = keys;
  return processor;
}

function _copyToken<TProps>(props: TProps, key: string, target: string | undefined, targetObj: object): void {
  if (props.hasOwnProperty(key)) {
    targetObj[target || key] = props[key];
  }
}

function _lookupOrCopyToken<TProps, TTheme>(props: TProps, theme: TTheme, entry: ITokenKeyLogic<TProps, TTheme>, style: object): void {
  const { key, lookup } = entry;
  if (props.hasOwnProperty(key)) {
    const lookupResult = lookup && lookup(theme);
    let val = props[key];
    if (typeof val === 'string' && lookupResult && lookupResult.hasOwnProperty(val)) {
      val = lookupResult[val as string];
    }
    style[entry.target || (key as string)] = val;
  }
}

function _processTokenEntries<TProps, TTheme>(
  props: TProps,
  theme: TTheme,
  mappings: IResolvedTokenMappings<TProps, TTheme>
): IComponentSettings {
  const result = {};
  Object.keys(mappings).forEach((slot: string) => {
    const slotProps: { style?: object } = {};
    const mapping = mappings[slot];
    if (mapping.toStyle.length > 0) {
      const slotStyle = {};
      for (const entry of mapping.toStyle) {
        _lookupOrCopyToken(props, theme, entry, slotStyle);
      }
      if (Object.keys(slotStyle).length > 0) {
        slotProps.style = slotStyle;
      }
    }
    for (const entry of mapping.toTokens) {
      _copyToken(props, entry.key as string, entry.target, slotProps);
    }
    result[slot] = slotProps;
  });
  return result;
}

function _pushMappings<TProps, TTheme>(
  mappings: IResolvedTokenMappings<TProps, TTheme>,
  tokens: ITokenProcessor<TProps, TTheme>[]
): IResolvedTokenMappings<TProps, TTheme> {
  // if there have been mappings set up then add a function that processes all the mappings
  if (Object.keys(mappings).length > 0) {
    tokens.push(
      setupTokenProcessor<TProps, TTheme>((props: TProps, theme: TTheme) => {
        return _processTokenEntries(props, theme, mappings);
      }, [])
    );
    return {};
  }
  return mappings;
}

export function buildComponentTokens<TProps, TTheme>(
  entries: ITokenInputEntry<TProps, TTheme>[],
  hasToken?: ITargetHasToken
): IComponentTokens<TProps, TTheme> {
  const tokenKeys: Map<string, boolean> = new Map<string, boolean>();
  const tokens: ITokenProcessor<TProps, TTheme>[] = [];
  let mappings: IResolvedTokenMappings<TProps, TTheme> = {};

  // parse the entries and build up token processors that are ready to run
  for (const entry of entries) {
    // if mapping is set on the object then this is a key set rather than a processor function
    const keySet: ITokenKeySet<TProps, TTheme> | undefined = (entry as ITokenKeySet<TProps, TTheme>).mapping
      ? (entry as ITokenKeySet<TProps, TTheme>)
      : undefined;

    if (keySet) {
      // process each slot that is being targeted
      for (const slot of keySet.slots) {
        // ensure that mapping is initialized
        mappings[slot] = mappings[slot] || { toStyle: [], toTokens: [] };
        const { toStyle, toTokens } = mappings[slot];
        for (const mapEntry of keySet.mapping) {
          tokenKeys.set(mapEntry.key as string, true);
          const transfer = hasToken && hasToken(slot, mapEntry.key as string);
          if (transfer) {
            toTokens.push(mapEntry);
          } else {
            toStyle.push(mapEntry);
          }
        }
      }
    } else {
      // if we are adding a function merge any active mappings together into a function and put it into the list
      // this ensures order
      mappings = _pushMappings(mappings, tokens);

      // in this case a token processor has been added directly.  Add the keys to the map and then add
      // the function to the queue directly
      const keys: string[] = (entry as ITokenProcessor<TProps, TTheme>)._keys as string[];
      keys.forEach((key: string) => tokenKeys.set(key, true));
      tokens.push(entry as ITokenProcessor<TProps, TTheme>);
    }
  }

  // finish any leftover mappings
  _pushMappings(mappings, tokens);

  return { tokenKeys, tokens };
}
