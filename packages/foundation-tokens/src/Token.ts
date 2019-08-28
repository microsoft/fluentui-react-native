import { ITokenEntry, IResolvedComponentTokenInfo, ITokenTransferSet, ITargetHasTokens, ITokenProcessor } from './Token.types';
import { ISlotProps, mergeSettings, IComponentSettings } from '@uifabric/theme-settings';

/**
 * Transfer token props into slot props where they exist.  The transfer object will be set up
 * when the component definition is created.
 *
 * @param tokenProps - set of props which include the various token values
 * @param transfer - token transfer set detailing which props to transfer into each entry
 */
export function transferTokens(tokenProps: object, transfer: ITokenTransferSet): ISlotProps | undefined {
  const result = {};
  Object.keys(transfer).forEach((key: string) => {
    const props = {};
    for (const entry of transfer[key]) {
      const source = typeof entry === 'string' ? entry : entry.source;
      if (tokenProps.hasOwnProperty(source)) {
        const target = typeof entry === 'string' ? entry : entry.target;
        props[target] = tokenProps[source];
      }
    }
    result[key] = props;
  });
  return result as ISlotProps;
}

/**
 * Run through the token processor array and build up a set of slot props to merge together
 *
 * @param props - props which contain token values
 * @param theme - theme used to look up styling values
 * @param tokens - token processor array
 */
export function resolveTokens(props: object, theme: object, tokens: ITokenEntry[]): ISlotProps[] {
  return tokens.map((entry: ITokenEntry) => {
    return entry.processor(props, theme, entry.targetSlots);
  });
}

/**
 * Apply any tokens from settings
 * @param props - mutable props object which has props from the user and will be augmented from settings
 * @param rootSlotProps - root slot props which will have tokens sources from settings
 * @param keys - array of prop keys which should be considered tokens
 */
export function addTokensToProps(props: object, rootSlotProps: object, keys: Map<string, boolean>): string {
  const cacheKeys: string[] = [];
  keys.forEach((_val: boolean, key: string) => {
    if (props.hasOwnProperty(key) && rootSlotProps[key] !== props[key]) {
      // in this case the user has specified this token and it is different than what came from settings
      // as a result this token becomes a key for looking up the resulting items
      cacheKeys.push(String(props[key]));
    } else {
      // in this case it is not a cache key so just add a separator (to avoid 'red', undefined equaling undefined, 'red')
      cacheKeys.push('');
      // if the token is actually set on rootSlotProps then put it into props
      if (rootSlotProps.hasOwnProperty(key)) {
        props[key] = rootSlotProps[key];
      }
    }
  });
  return cacheKeys.join('-');
}

/**
 * Run through the end to end token workflow for render.  This will resolve the tokens and attempt to preempt style creation
 * by referencing values in the cache
 *
 * @param props - user props passed in and copied into a mutable object, these have precedence
 * @param theme - theme to get styling info from
 * @param slotProps - starting slotProps, the root entry may have token defaults filled in
 * @param tokens - the array of token processors
 * @param tokenKeys - the combined set of token keys referenced by the processors
 * @param baseCacheKey - cache key to append token info to, this generally refers to the settings
 * @param cache - cache which holds the slotProps if they have been built before
 */
export function processTokens(
  props: object,
  theme: object,
  slotProps: IComponentSettings,
  tokenInfo: IResolvedComponentTokenInfo,
  baseCacheKey: string,
  cache: object
): ISlotProps {
  // merge in tokens and build up the cache key which are the tokens overridden by the user
  const cacheKey = baseCacheKey + addTokensToProps(props, slotProps.root, tokenInfo.tokenKeys);

  // if this is not already cached there is work to do
  if (!cache[cacheKey]) {
    // run through the tokens and build a list of slotProps to merge together
    const propsToMerge = resolveTokens(props, theme, tokenInfo.tokens) || [];
    // if there is a transfer list run through that as well
    if (tokenInfo.transfer) {
      propsToMerge.push(transferTokens(props, tokenInfo.transfer));
    }
    // merge the settings and cache them
    cache[cacheKey] = mergeSettings(slotProps, ...propsToMerge);
  }

  // return the cache entry
  return cache[cacheKey];
}

/**
 * Take a token entry array defined by a component author and prepare it for first use.  This should
 * be done once per component type, not per component instance.
 *
 * @param inputTokens - token array to prepare for use
 * @param targetHasTokens - callback function to check whether the target slot supports these tokens
 */
export function prepareTokensForRender(
  inputTokens?: ITokenEntry[],
  targetHasTokens?: ITargetHasTokens
): IResolvedComponentTokenInfo | undefined {
  if (inputTokens && inputTokens.length > 0) {
    const transfer: ITokenTransferSet = {};
    const tokenKeys: Map<string, boolean> = new Map<string, boolean>();
    const tokens: ITokenEntry[] = [];

    // process the list of token entries defined by the component author
    for (const token of inputTokens) {
      const processor = token.processor;
      const keys = processor._keys;

      // create a copy of the entry as the various arrays might be modified
      const newEntry: ITokenEntry = { processor, targetSlots: [] };
      const allowTransfer = processor._allowTransfer && targetHasTokens && keys;

      // go through the list of targets and split them into transfer targets or style targets
      for (const slot of token.targetSlots) {
        if (allowTransfer && targetHasTokens(slot, keys)) {
          transfer[slot] = transfer[slot] || [];
          transfer[slot].push(...keys);
        } else {
          newEntry.targetSlots.push(slot);
        }
      }

      // aggregate the keys in a map for the keys
      for (const key of keys) {
        tokenKeys.set(key, true);
      }

      // add it to the array if there are style targets, otherwise there is no reason to call the processor
      if (newEntry.targetSlots.length > 0) {
        tokens.push(newEntry);
      }
    }
    return { tokens, tokenKeys, transfer: Object.keys(transfer).length > 0 ? transfer : undefined };
  }
  return undefined;
}

/**
 * A simple decorator function to make inputting the token entries cleaner looking.
 * @param processor - processor to use
 * @param targets - target slots
 */
export function token<TProps extends object, TTheme>(
  processor: ITokenProcessor<TProps, TTheme>,
  ...targets: string[]
): ITokenEntry<TProps, TTheme> {
  return {
    processor,
    targetSlots: targets
  };
}

export function targetHasTokens(keyMap: Map<string, boolean> | false | undefined, keys: string[]): boolean {
  if (keyMap) {
    for (const key of keys) {
      if (!keyMap.get(key)) {
        return false;
      }
    }
  }
  return !!keyMap;
}
