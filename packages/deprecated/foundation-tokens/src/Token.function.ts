import type { GetTypedMemoValue } from '@fluentui-react-native/framework-base';
import { mergeProps } from '@fluentui-react-native/framework-base';
import type { ISlotProps } from '@uifabricshared/foundation-settings';

import type { ITokenPropInfo, ICachedPropHandlers } from './Token.internal';
import type {
  ITargetHasToken,
  IStyleFactoryOperation,
  IComponentTokens,
  IStyleFactories,
  IStyleFinalizer,
  IStyleFactoryFunction,
} from './Token.types';

interface ITokensForSlot<TProps, TTokens, TTheme> {
  toStyle: IStyleFactoryOperation<TTokens, TTheme>[];
  toTokens: IStyleFactoryOperation<TTokens, TTheme>[];
  functions: IStyleFactoryFunction<TProps, TTokens, TTheme>[];
}

function _copyToken<TTokens>(props: TTokens, key: string, target: string | undefined, targetObj: object): void {
  if (props[key] !== undefined) {
    targetObj[target || key] = props[key];
  }
}

function _lookupOrCopyToken<TTokens, TTheme>(
  props: TTokens,
  theme: TTheme,
  entry: IStyleFactoryOperation<TTokens, TTheme>,
  style: object,
): void {
  const { source: key, lookup } = entry;
  if (props[key] !== undefined) {
    const lookupResult = lookup && lookup(theme);
    let val = props[key];
    if (typeof val === 'string' && lookupResult && lookupResult[val as string] !== undefined) {
      val = lookupResult[val as string];
    }
    style[entry.target || (key as string)] = val;
  }
}

function _processSlotEntries<TProps, TTokens, TTheme>(
  props: TTokens,
  theme: TTheme,
  mapping: ITokensForSlot<TProps, TTokens, TTheme>,
): TProps {
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

function _processStyleFunctions<TProps, TTokens, TTheme>(
  functions: IStyleFactoryFunction<TProps, TTokens, TTheme>[],
  tokenProps: TTokens,
  theme: TTheme,
): TProps | undefined {
  if (functions && functions.length > 0) {
    return mergeProps(...functions.map((fn) => fn(tokenProps, theme)));
  }
  return undefined;
}

/**
 * This is the worker function that does the work of either retrieving a cached props/style from the cache
 * or building up the new props/style set
 */
function _getCachedPropsForSlot<TProps, TTokens, TTheme>(
  props: TProps,
  tokenProps: ITokenPropInfo<TTokens>,
  theme: TTheme,
  slotName: string,
  getMemoValue: GetTypedMemoValue<TProps>,
  keys: string[],
  mappings: ITokensForSlot<TProps, TTokens, TTheme>,
  finalizer?: IStyleFinalizer<TProps>,
): TProps {
  // get the cache key for this entry
  const { tokens, tokenKeys, deltas } = tokenProps;
  return getMemoValue(() => {
    let newProps: TProps = mergeProps<any>(
      props as unknown as object,
      slotName === 'root' ? tokenKeys : undefined,
      _processSlotEntries(tokens, theme, mappings) as unknown as object,
      _processStyleFunctions(mappings.functions, tokens, theme),
    );
    if (finalizer) {
      newProps = finalizer(newProps, slotName);
    }
    return newProps;
  }, [slotName, ...keys.map((val) => (deltas[val] !== undefined ? deltas[val] : ''))])[0];
}

/**
 * This function runs at component definition time (once for every component type) and
 * processes the styleFactories on each of the slots and builds up handler functions that
 * obtain or build the cached props.
 *
 * @param factories - collection of slot style factories
 * @param hasToken - a function that returns whether or not a slot supports a given token
 */
export function buildComponentTokens<TSlotProps extends ISlotProps, TTokens, TTheme>(
  factories: IStyleFactories<TSlotProps, TTokens, TTheme>,
  hasToken?: ITargetHasToken,
): IComponentTokens<TSlotProps, TTokens, TTheme> {
  const tokenKeys: { [key: string]: undefined } = {};
  const handlers: ICachedPropHandlers<TSlotProps, TTokens, TTheme> = {} as ICachedPropHandlers<TSlotProps, TTokens, TTheme>;

  // iterate through each factory and generate a handler for it.  Note that even if no styleFactories
  // are provided within it will still generate the handler to do style caching and finalization
  Object.getOwnPropertyNames(factories).forEach((slot) => {
    type IPropsForSlot = TSlotProps[keyof TSlotProps];
    const factoriesBase = factories[slot];
    const mappings: ITokensForSlot<IPropsForSlot, TTokens, TTheme> = { toStyle: [], toTokens: [], functions: [] };
    const { toStyle, toTokens, functions } = mappings;
    const slotKeys = {};

    // if there are style factories provided split them into ones that target tokens and ones that target styles
    if (factoriesBase) {
      const factorySet = Array.isArray(factoriesBase) ? factoriesBase : [factoriesBase];
      for (const set of factorySet) {
        if (typeof set === 'function') {
          functions.push(set);
          set._keys.forEach((key) => {
            slotKeys[key as string] = undefined;
          });
        } else {
          const setArray = Array.isArray(set) ? set : [set as IStyleFactoryOperation<TTokens, TTheme>];
          for (const operation of setArray) {
            slotKeys[operation.source as string] = undefined;
            const target = operation.target || operation.source;
            if (hasToken && hasToken(slot, target as string)) {
              toTokens.push(operation);
            } else {
              toStyle.push(operation);
            }
          }
        }
      }
    }

    // add the collected keys to the root token keys
    Object.assign(tokenKeys, slotKeys);

    // create the closure for the handler and return that in the object
    handlers[slot as keyof TSlotProps] = (
      props: IPropsForSlot,
      tokenProps: ITokenPropInfo<TTokens>,
      theme: TTheme,
      slotName: string,
      getValue: GetTypedMemoValue<IPropsForSlot>,
    ) => {
      const keys = Object.getOwnPropertyNames(slotKeys);
      return _getCachedPropsForSlot<IPropsForSlot, TTokens, TTheme>(props, tokenProps, theme, slotName, getValue, keys, mappings);
    };
  });
  return { tokenKeys, handlers };
}
