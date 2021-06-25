/**
 * The basic options for recursion at a given level.  Two types for two behaviors:
 *
 * boolean:
 *  - if true, recurse indefinitely
 *  - if false, don't recurse
 *
 * number:
 *  - if 0, don't recurse from this level
 *  - if > 0, recurse that many times then stop
 *  - if < 0, recurse indefinitely
 */
export type RecursionOption = boolean | number;

/**
 * a function that can be set to merge arguments
 */
export type CustomRecursionHandler = (...vals: any[]) => any;

/**
 * built in handler functions that can be applied for a given key
 */
export type BuiltinRecursionHandlers = 'appendArray';

/**
 * Handlers for recursion of a given key or type.  These can either be functions or a reference to a supported
 * built-in merge routine
 */
export type RecursionHandler = BuiltinRecursionHandlers | CustomRecursionHandler;

/**
 * configuration object for the merge, key names are matched with a few exceptions:
 * - object: matches non-array object types
 * - array: matches array types
 * - [key: string]: matches anything by name
 */
export interface MergeOptions {
  [objectTypeOrKeyName: string]: RecursionOption | RecursionHandler | MergeOptions;
}

/**
 * built in handlers for the module
 */
const _builtinHandlers: { [K in BuiltinRecursionHandlers]: CustomRecursionHandler } = {
  appendArray: (...objs: any[]) => {
    return [].concat(...objs);
  },
};

/**
 * This processes the various type options for merge core and turns them into a MergeConfig
 * @param options - options passed into immutableMergeCore
 */
function normalizeOptions(options: RecursionOption | MergeOptions): [MergeOptions, boolean] {
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

/** resolve custom handlers if they are applicable */
function resolveIfHandler(option: RecursionHandler | RecursionOption | MergeOptions): CustomRecursionHandler | MergeOptions | undefined {
  return typeof option === 'function' ? option : typeof option === 'string' ? _builtinHandlers[option] : undefined;
}

/** pass array configurations down, this allows for saying all arrays should be appended rather than replaced */
function getTypesMixin(config: MergeOptions): MergeOptions {
  return config.array ? { array: config.array } : {};
}

/** resolve the object behaviors for configuration */
function resolveForObject(option: RecursionHandler | RecursionOption | MergeOptions, mixin: MergeOptions): MergeOptions | undefined {
  if (typeof option === 'boolean') {
    // booleans won't recurse if false, otherwise recurse infinitely
    return option ? { object: option, ...mixin } : mixin;
  } else if (typeof option === 'number') {
    // numbers get decremented or set to false if we've reached zero.  Negative values will have been converted to boolean true
    return option === 0 ? mixin : { object: option - 1, ...mixin };
  } else {
    // otherwise it is an object type so just pass the child object through
    return option as MergeOptions;
  }
}

/**
 * Figure out the handler for this property.
 * It will either be a function, a config object to pass to a recursive call, or undefined
 * in the undefined case, this key will be left as-is
 */
function getHandlerForPropertyOfType(
  config: MergeOptions,
  propKey: string,
  propType: string,
): CustomRecursionHandler | MergeOptions | undefined {
  let result: CustomRecursionHandler | MergeOptions | undefined = undefined;
  const option = config[propKey] !== undefined ? config[propKey] : config[propType] !== undefined ? config[propType] : undefined;

  if (option !== undefined) {
    // try to resolve the option as a handler, either function or built-in first.  This is the only option that is valid for non-object types.
    result = resolveIfHandler(option);

    // if it is an object then resolve boolean, number or config types
    if (result === undefined && propType === 'object') {
      result = resolveForObject(option, getTypesMixin(config));
    }
  }

  return result;
}

/**
 * This will merge two or more objects together using an immutable style merge pattern.  If there is only one object or
 * if there is only one object with values, that object itself will be returned, with two or more objects the keys within will
 * be first merged with Object.assign and then optionally will recurse to merge sub objects as specified by the options.
 *
 * Note that this tries hard to not create extra objects, because of this merging an object with an empty object will not
 * create a new object.
 *
 * @param mergeOptions - options driving behavior of the merge.  See MergeOptions for a description
 * @param singleMode - normally if there is only one branch to follow in the merge the routine will not recurse.  If single mode
 * is true the routine will progress through all branches of the hierarchy.  Useful if using a processor function that needs to be run.
 * @param objs - an array of objects to merge together
 */
function immutableMergeWorker<T extends object>(mergeOptions: RecursionOption | MergeOptions, singleMode: boolean, ...objs: T[]): T {
  const setToMerge = objs.filter((v) => v && getEntityType(v) === 'object' && Object.getOwnPropertyNames(v).length > 0);
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
          const handler = getHandlerForPropertyOfType(options, key, entityType);
          if (handler !== undefined) {
            const values = setToMerge.map((set) => set[key]).filter((v) => v !== undefined);
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
export function immutableMergeCore<T extends object>(options: RecursionOption | MergeOptions, ...objs: (T | undefined)[]): T | undefined {
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
