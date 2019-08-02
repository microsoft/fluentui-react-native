# Immutable Merge package

This package provides a relatively concise routine to handle merging multiple objects together with the following characteristics:

- No modifications will be made to any object
- The resulting object will have the minimum number of updates. If only one value is updated three levels deep, only that value and the chain of containing objects will be recreated.
- Empty objects or undefined objects will be ignored and not cause a new branch to be created.
- Recursion is controllable in a variety of ways

## IMergeOptions

| Property                                  | Description                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `depth?: number`                          | Depth of recursion. Positive numbers will recurse that number of times, 0 will not recurse, a negative number will recurse infinitely. Unspecified is treated as 0.                                                                                                                                                                                |
| `processSingles?: boolean`                | If true this will run through the tree even if there is only one viable branch. This is used to allow handlers to optionally update branches of the tree. This allows the routine to be used for things like processing all style objects in a complex tree, optionally changing them based on some logic, and returning a minimally updated tree. |
| `recurse?: { [key] : boolean | handler }` | This allows overriding the normal handling based on the name of encountered keys. A value of true means that the routine will always recurse if that value is encountered. Specifying a handler function will cause that handler to be run when that key is encountered.                                                                           |

## IMergeRecursionHandler

This is the signature for a handler function that can handle a named branch of the tree.

    export type IMergeRecursionHandler = (
      key: string,
      options: IMergeOptions,
      ...objs: (object | undefined)[]) => object | undefined;

The array of objects or undefined values (internally treated as anything falsy) should be processed, returning a single object or undefined.

The key and options parameters are provided as conveniences in the case that a single handler needs to differentiate different branches or know how deep it is in the tree. In many cases these can be ignored.

## immutableMerge

    export function immutableMerge(
      options: IMergeOptions, ...objs: (object | undefined)[]
    ): object | undefined {

The routine works as described above with one notable behavior. Unlike `Object.assign()`, undefined values will cause the key to be deleted. Otherwise there is no easy way to delete keys using an immutable style pattern. So merging works as follows:

    const obj1 = {
      foo: 'hello',
      bar: 'world'
    };

    const obj2 = {
      bar: undefined
    };

    const objIM = immutableMerge({}, obj1, obj2);
    // objIM.hasOwnProperty('bar') will return false

    const objAssign = Object.assign({}, obj1, obj2);
    // objAssign.hasOwnProperty('bar') will return true but objAssign['bar'] will be undefined

## Things to Explore

- This should be stress tested and perf tested, because it is such a core routine it needs to be very fast.
