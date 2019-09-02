export interface IMergeOptions {
  /**
   * number of times to recurse:
   *  - <0 : infinite
   *  - 0 or undefined : don't recurse
   *  - 1+ : recurse this many levels
   */
  depth?: number;

  /**
   * if true this will run through the tree even if there is only one viable branch.  This is so the handlers can do
   * processing, only modifying the tree if something is updated
   */
  processSingles?: boolean;

  /**
   * map of key values to recurse on, this will override the depth if specified
   */
  recurse?: { [key: string]: boolean | IMergeRecursionHandler };
}

export type IMergeRecursionHandler = (options: IMergeOptions, ...objs: any[]) => any;

/**
 * This will merge two or more objects together using an immutable style merge pattern.  If there is only one object or
 * if there is only one object with values, that object will be returned, with two or more objects the keys within will
 * be first merged with Object.assign and then optionally will recurse to merge sub objects as specified by the options.
 *
 * Note that this tries hard to not create extra objects, because of this merging an object with an empty object will not
 * create a new object.
 *
 * @param options - options driving behavior of the merge.  See IMergeOptions for a description.  Some basic combos would
 * be {} - no recursion, { depth: -1 } - recurse infinitely
 * @param objs - an array of objects to merge together
 */
export function immutableMerge(options: IMergeOptions, ...objs: any[]): any {
  const setToMerge = objs.filter(v => _isObject(v, true));
  const { depth = 0, recurse } = options;
  const processSingle = options.processSingles && setToMerge.length === 1;

  // there is work to do if there is more than one object to merge or if we are proessing single objects
  if (setToMerge.length > 1 || processSingle) {
    const nextOptions = depth || recurse ? { ...options, depth: depth ? depth - 1 : 0 } : undefined;
    let hasChanged = false;

    // now assign everything to get the normal property precedence (and merge all the keys)
    const result = Object.assign({}, ...setToMerge);

    // if there is a possibility of needing the recurse, process the keys
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        const originalVal = result[key];

        // next options is only set if there is a possibility of recursion
        if (nextOptions) {
          const isObject = _isObject(originalVal);
          const recurseKey = recurse && recurse[key];
          const customHandler = recurseKey && typeof recurseKey === 'function' ? recurseKey : false;

          // if this key has a custom handler, or is an object eligible for recursion, recurse
          if (customHandler || (isObject && (depth || recurseKey))) {
            // collect all the keys, filtering out undefined values
            const collectedObjects = setToMerge
              .map((value: any) => {
                return _collectVal(value && value[key], !!customHandler);
              })
              .filter(v => v !== undefined);

            // either recurse to this function or call the custom handler if specified
            const handler: IMergeRecursionHandler = customHandler || immutableMerge;
            result[key] = handler(nextOptions, ...collectedObjects);
            hasChanged = hasChanged || result[key] !== originalVal;
          }
        }

        // delete undefined keys from the object, otherwise there is no easy way to delete keys
        if (result[key] === undefined) {
          delete result[key];
        }
      }
    }
    // in the single processing case return the original if nothing changed, otherwise return result
    return processSingle && !hasChanged ? setToMerge[0] : result;
  }
  return setToMerge.length > 0 ? setToMerge[0] : undefined;
}

function _isObject(t: any, nonEmpty?: boolean): boolean {
  return t && typeof t === 'object' && !Array.isArray(t) && (!nonEmpty || Object.getOwnPropertyNames(t).length > 0);
}

function _collectVal(t: any, custom: boolean): any {
  return ((custom || _isObject(t)) && t) || undefined;
}
