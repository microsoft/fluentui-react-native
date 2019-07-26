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

export type IMergeRecursionHandler = (key: string, options: IMergeOptions, ...objs: (object | undefined)[]) => object | undefined;

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
export function immutableMerge(options: IMergeOptions, ...objs: (object | undefined)[]): object | undefined {
  const setToMerge = objs.filter((value: object | undefined) => {
    return value && Object.getOwnPropertyNames(value).length > 0;
  });
  const processSingle = options.processSingles && setToMerge.length === 1;
  if (setToMerge.length > 1 || processSingle) {
    const depth = options.depth || 0;
    const recurse = options.recurse;
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
          // if this key qualifies for recursion and the last value set was an object, try to merge
          if ((depth || (recurse && recurse[key])) && typeof originalVal === 'object') {
            const collectedObjects = setToMerge.map((value: object | undefined) => {
              return typeof value![key] === 'object' ? value![key] : undefined;
            });
            const handler = recurse && recurse[key];
            result[key] =
              handler && typeof handler === 'function'
                ? handler(key, nextOptions, ...collectedObjects)
                : immutableMerge(nextOptions, ...collectedObjects);

            // this only matters for the single process case, in that case the only possible change is from a special
            // handler on recursion, so if it has returned a new object mark that it has changed
            if (result[key] !== originalVal) {
              hasChanged = true;
            }
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
