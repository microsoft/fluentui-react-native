/**
 * a function that can be set to merge arguments
 */
export type MergeRecursionHandler = (...objs: any[]) => any;

/**
 * built in handler functions that can be applied for a given key
 */
export type MergeHandlers = 'appendArray';

const _builtinHandlers: { [K in MergeHandlers]: MergeRecursionHandler } = {
  appendArray: (...objs: any[]) => {
    return [].concat(...objs);
  }
};

/**
 * combined type for merge configurations.  This can be of a number of types
 * - boolean: if true, deep merge, if false don't merge this key
 * - number: if >= 0 merge that number of levels in the tree then stop, if negative deep merge
 * - MergeHandlers (string): use one of the built-in merge handlers
 * - MergeRecursionHandler: use the given function to merge these keys together
 * - T: use the merge config as the configuration for the child
 */
export type MergeKeyType<T> = number | boolean | MergeHandlers | MergeRecursionHandler | T;

/**
 * configuration object for the merge, key names are matched with a few exceptions:
 * - object: matches non-array object types
 * - array: matches array types
 * - [key: string]: matches anything by name
 */
export interface MergeConfig {
  object?: MergeKeyType<MergeConfig>;
  array?: MergeKeyType<MergeConfig>;
  [key: string]: MergeKeyType<MergeConfig>;
}

/**
 * Options which can be passed into the immutable merge core routine.  This can be one
 * of:
 * - boolean - if true deeply merge, must not be false at the root
 * - number - >= 0 is how many times to recurse before stopping merging, < 0 is the same as boolean true
 * - MergeConfig - more detailed options for the merge
 */
export type MergeOptions = MergeConfig | boolean | number;

/**
 * This processes the various type options for merge core and turns them into a MergeConfig
 * @param options - options passed into immutableMergeCore
 */
function normalizeOptions(options: MergeOptions): [MergeConfig, boolean] {
  return typeof options === 'boolean'
    ? [{ object: options }, options]
    : typeof options === 'number'
    ? [{ object: options >= 0 ? options : true }, options !== 0]
    : [options, true];
}

/**
 * Return the type except return 'array' for objects that are arrays
 * @param val - value to check type
 */
function getEntityType(val: any): 'array' | string {
  return typeof val === 'object' ? (Array.isArray(val) ? 'array' : 'object') : typeof val;
}

/**
 * Figure out the handler for this key.  It will either be a function, a config object to pass to a recursive call, or undefined
 * in which case this key will be left as-is
 *
 * @param config - configuration for this merge call
 * @param key - key being processed
 * @param entityType - entity type of this key
 */
function getHandlerForKey(config: MergeConfig, key: string, entityType: string): MergeRecursionHandler | MergeConfig | undefined {
  const option = config[key] !== undefined ? config[key] : config[entityType] !== undefined ? config[entityType] : undefined;
  if (option !== undefined) {
    // if this is a function it can just be returned as the handler
    if (typeof option === 'function') {
      return option;
    }

    // if this is a string it is only valid if it routes to a built-in handler
    if (typeof option === 'string') {
      return _builtinHandlers[option] ? _builtinHandlers[option] : undefined;
    }

    // other handlers only apply to object entities
    if (entityType === 'object') {
      // if we deeply recurse in some form pass the general array handler on
      const mixin = config.array ? { array: config.array } : {};

      // booleans won't recurse if false, otherwise recurse infinitely
      if (typeof option === 'boolean') {
        return option ? { object: option, ...mixin } : undefined;
      }

      // numbers get decremented or set to false if we've reached zero.  Negative values will have been converted to boolean true
      if (typeof option === 'number') {
        return option === 0 ? { ...mixin } : { object: option - 1, ...mixin };
      }

      return option;
    }
  }
  return undefined;
}

/**
 * This will merge two or more objects together using an immutable style merge pattern.  If there is only one object or
 * if there is only one object with values, that object will be returned, with two or more objects the keys within will
 * be first merged with Object.assign and then optionally will recurse to merge sub objects as specified by the options.
 *
 * Note that this tries hard to not create extra objects, because of this merging an object with an empty object will not
 * create a new object.
 *
 * @param options - options driving behavior of the merge.  See IMergeOptions for a description.  Some basic combos would
 * be `{}` - no recursion, `{ depth: -1 }` - recurse infinitely
 * @param objs - an array of objects to merge together
 */
function immutableMergeWorker(mergeOptions: MergeOptions, singleMode: boolean, ...objs: any[]): any {
  const setToMerge = objs.filter(v => getEntityType(v) === 'object' && Object.getOwnPropertyNames(v).length > 0);
  const [options, mightRecurse] = normalizeOptions(mergeOptions);
  const processSingle = singleMode && setToMerge.length === 1;

  // there is work to do if there is more than one object to merge or if we are processing single objects
  if (setToMerge.length > 1 || (processSingle && setToMerge.length === 1)) {
    // now assign everything to get the normal property precedence (and merge all the keys)
    let result = processSingle ? undefined : Object.assign({}, ...setToMerge);
    const processSet = result || setToMerge[0];

    for (const key in processSet) {
      if (processSet.hasOwnProperty(key)) {
        // only process if there is potential work to do
        if (mightRecurse) {
          const originalVal = processSet[key];
          const entityType = getEntityType(originalVal);
          const handler = getHandlerForKey(options, key, entityType);
          if (handler !== undefined) {
            const values = setToMerge.map(set => set[key]).filter(v => v !== undefined);
            const updatedVal = typeof handler === 'function' ? handler(...values) : immutableMergeWorker(handler, singleMode, ...values);
            if (updatedVal !== originalVal) {
              result = result || Object.assign({}, ...setToMerge);
              result[key] = updatedVal;
            }
          }
        }

        // delete undefined keys from the object, otherwise there is no easy way to delete keys
        if (!processSingle && result[key] === undefined) {
          delete result[key];
        }
      }
    }

    // in the single processing case return the original if nothing changed, otherwise return result
    return result || processSet;
  }
  return setToMerge.length > 0 ? setToMerge[0] : undefined;
}

/**
 * Recursively immutable merge sets of objects infinitely deep.  This behaves like a standard deep merge with arrays replacing
 * one another rather than appending.  If appending arrays is desireable this can be configured via immutableMergeCore
 *
 * @param objs - variable input array of typed objects to merge
 */
export function immutableMerge<T extends object>(...objs: (T | undefined)[]): T | undefined {
  return immutableMergeWorker(true, false, ...objs);
}

/**
 * Version of immutable merge that can be configured to behave in a variety of manners.  See the documentation for details.
 *
 * @param options - configuration options for the merge, this dictates what keys will be handled in what way
 * @param objs - set of objects to merge together
 */
export function immutableMergeCore<T extends object>(options: MergeOptions, ...objs: (T | undefined)[]): T | undefined {
  return immutableMergeWorker(options, false, ...objs);
}

/**
 * Process one or more immutable objects ensuring that handlers are called on every entry that applies.  If a single object
 * is passed in and no changes are made, that object will be returned.  If updates happen from the handlers it will return the
 * minimally mutated object.
 *
 * The use case for this might be a style transformation on a deeply nested object.  If no changes are made the object won't be
 * updated but in the case where something needs to be transformed this will perform the minimal mutations.
 *
 * @param processors - set of processor functions for handling keys
 * @param objs - one or more objects to process.  If multiple objects are passed they will be merged
 */
export function processImmutable<T extends object>(options: MergeOptions, ...objs: (T | undefined)[]): T | undefined {
  return immutableMergeWorker(options, true, ...objs);
}
