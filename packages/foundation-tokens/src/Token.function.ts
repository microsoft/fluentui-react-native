import { mergeProps } from '@uifabric/foundation-settings';
import {
  ITargetHasToken,
  IStyleFactoryOperation,
  IComponentTokens,
  IStyleFactories,
  IStyleFinalizer,
  IStyleFactoryFunction,
  IStyleFactoryFunctionRaw
} from './Token.types';
import { ITokenPropInfo, ICachedPropHandlers, ICacheInfo } from './Token.internal';

/**
 * Helper to make it easy to create a style factory function.  Function statics are super convenient
 * but kind of annoying to set up
 *
 * @param fn - function to decorate with keys
 * @param keys - keys to append as a static to the function
 */
export function styleFunction<TProps, TTheme>(
  fn: IStyleFactoryFunctionRaw<TProps, TTheme>,
  keys: (keyof TProps)[]
): IStyleFactoryFunction<TProps, TTheme> {
  (fn as IStyleFactoryFunction<TProps, TTheme>)._keys = keys;
  return fn as IStyleFactoryFunction<TProps, TTheme>;
}

interface ITokensForSlot<TProps, TTheme> {
  toStyle: IStyleFactoryOperation<TProps, TTheme>[];
  toTokens: IStyleFactoryOperation<TProps, TTheme>[];
  functions: IStyleFactoryFunction<TProps, TTheme>[];
}

function _copyToken<TProps>(props: TProps, key: string, target: string | undefined, targetObj: object): void {
  if (props.hasOwnProperty(key)) {
    targetObj[target || key] = props[key];
  }
}

function _lookupOrCopyToken<TProps, TTheme>(
  props: TProps,
  theme: TTheme,
  entry: IStyleFactoryOperation<TProps, TTheme>,
  style: object
): void {
  const { source: key, lookup } = entry;
  if (props.hasOwnProperty(key)) {
    const lookupResult = lookup && lookup(theme);
    let val = props[key];
    if (typeof val === 'string' && lookupResult && lookupResult.hasOwnProperty(val)) {
      val = lookupResult[val as string];
    }
    style[entry.target || (key as string)] = val;
  }
}

function _processSlotEntries<TProps, TTheme>(props: TProps, theme: TTheme, mapping: ITokensForSlot<TProps, TTheme>): TProps {
  const slotProps: { style?: object } = {};
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
    _copyToken(props, entry.source as string, entry.target, slotProps);
  }
  return slotProps as TProps;
}

function _processStyleFunctions<TProps extends object, TTheme>(
  functions: IStyleFactoryFunction<TProps, TTheme>[],
  tokenProps: TProps,
  theme: TTheme
): TProps | undefined {
  if (functions && functions.length > 0) {
    return mergeProps(...functions.map(fn => fn(tokenProps, theme)));
  }
  return undefined;
}

function _buildTokenKey<TProps>(deltas: TProps, keys: string[], slotName: string, cacheInfo: ICacheInfo): string {
  const key = cacheInfo.prefix + '-' + slotName + '-';
  return key + keys.map(val => (deltas.hasOwnProperty(val) ? String(deltas[val]) : '')).join('-');
}

/**
 * This is the worker function that does the work of either retrieving a cached props/style from the cache
 * or building up the new props/style set
 */
function _getCachedPropsForSlot<TProps extends object, TTheme>(
  props: TProps,
  tokenProps: ITokenPropInfo<TProps>,
  theme: TTheme,
  slotName: string,
  cacheInfo: ICacheInfo,
  keys: string[],
  mappings: ITokensForSlot<TProps, TTheme>,
  finalizer?: IStyleFinalizer<TProps>
): TProps {
  // get the cache key for this entry
  const { tokens, tokenKeys, deltas } = tokenProps;
  const key = _buildTokenKey(deltas, keys, slotName, cacheInfo);
  const cache = cacheInfo.cache;

  // if it isn't in the cache then process the tokens to build it up
  if (!cache[key]) {
    let newProps: TProps = mergeProps(
      props,
      slotName === 'root' ? tokenKeys : undefined,
      _processSlotEntries(tokens, theme, mappings),
      _processStyleFunctions(mappings.functions, tokens, theme)
    );
    if (finalizer) {
      newProps = finalizer(newProps, slotName, cacheInfo);
    }
    cache[key] = newProps;
  }
  return cache[key];
}

/**
 * This function runs at component definition time (once for every component type) and
 * processes the styleFactories on each of the slots and builds up handler functions that
 * obtain or build the cached props.
 *
 * @param factories - collection of slot style factories
 * @param hasToken - a function that returns whether or not a slot supports a given token
 */
export function buildComponentTokens<TProps extends object, TTheme>(
  factories: IStyleFactories<TProps, TTheme>,
  hasToken?: ITargetHasToken,
  finalizer?: IStyleFinalizer<TProps>
): IComponentTokens<TProps, TTheme> {
  const tokenKeys: { [key: string]: undefined } = {};
  const handlers: ICachedPropHandlers<TProps, TTheme> = {} as ICachedPropHandlers<TProps, TTheme>;

  // iterate through each factory and generate a handler for it.  Note that even if no styleFactories
  // are provided within it will still generate the handler to do style caching and finalization
  Object.getOwnPropertyNames(factories).forEach(slot => {
    const factorySet = factories[slot].styleFactories;
    const mappings: ITokensForSlot<TProps, TTheme> = { toStyle: [], toTokens: [], functions: [] };
    const { toStyle, toTokens, functions } = mappings;
    const slotKeys = {};

    // if there are style factories provided split them into ones that target tokens and ones that target styles
    if (factorySet) {
      for (const set of factorySet) {
        if (Array.isArray(set)) {
          for (const operation of set) {
            slotKeys[operation.source as string] = undefined;
            const target = operation.target || operation.source;
            if (hasToken && hasToken(slot, target as string)) {
              toTokens.push(operation);
            } else {
              toStyle.push(operation);
            }
          }
        } else {
          functions.push(set);
          set._keys.forEach(key => {
            slotKeys[key as string] = undefined;
          });
        }
      }
    }

    // add the collected keys to the root token keys
    Object.assign(tokenKeys, slotKeys);

    // create the closure for the handler and return that in the object
    handlers[slot] = (props: TProps, tokenProps: ITokenPropInfo<TProps>, theme: TTheme, slotName: string, cacheInfo: ICacheInfo) => {
      const keys = Object.getOwnPropertyNames(slotKeys);
      return _getCachedPropsForSlot(props, tokenProps, theme, slotName, cacheInfo, keys, mappings, finalizer);
    };
  });
  return { tokenKeys, handlers };
}
