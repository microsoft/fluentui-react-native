# Immutable Merge package

This package provides a relatively concise routine to handle merging multiple objects together with the following characteristics:

- No modifications will be made to any object
- Minimal updates. If only one value is updated three levels deep, only that value and the chain of containing objects will be recreated.
- Empty objects or undefined objects will be ignored and not cause a new branch to be created.
- Recursion is controllable in a variety of ways

Note that this does not provide a **strict** immutable package on its own. It also doesn't operate or return only readonly objects. This is to provide flexibility. It could easily be wrapped in various ways to provide that type of functionality, but it is provided in a more flexible form to be useful in other scenarios as well.

## Deep Merge via `immutableMerge`

For standard deep merging, this package provides the `immutableMerge` function. The signature is as follows:

```ts
export function immutableMerge<T extends object>(...objs: (T | undefined)[]): T | undefined;
```

This takes one or more objects of type `T` and deep merges them. If objects are undefined or null in some manner they will be ignored. Merging via this routine (and all routines in the package) typically follow the semantics of `Object.assign`, with a few extra behaviors.

- all values at a given level will overwrite, with the last writer winning
- if a key does not exist for an object it is ignored
- if a key does exist, even if it is `undefined` it will replace the previous value
- only non-array objects will recurse, arrays will be replaced rather than appended
- keys which exist and have a value of `undefined` will be deleted

The peculiar pattern of deleting keys which end up as undefined is the only way to delete a key without violating the core principles. An example of key deletion might look like:

```ts
const newObj = immutableMerge(myObj, { keyToDelete1: undefined, keyToDelete2: undefined });
```

## Custom Merging via `immutableMergeCore`

In many cases, merges have to follow additional rules to match the structure or behavior of objects passed in. This results in authoring custom merge routines to handle this constraint. This package allows for deep customization of merge behaviors via `immutableMergeCore`.

```ts
export function immutableMergeCore<T extends object>(options: RecursionOptions | MergeOptions, ...objs: (T | undefined)[]): T | undefined;
```

### RecursionOptions

Recursion options can be a boolean or a number with behavior interpreted as follows:

- `boolean` - Should this recurse. If the value is `true` it will recurse infinitely, if `false` it will not recurse.
- `number` - Recursion depth. A value of `0` will not recurse any farther, a positive value will recurse that many additional levels before stopping, a negative value will recurse indefinitely.

### MergeOptions

This object allows very precise control of the recursion. At a given level it matches values by name of the key, or by the resulting type of the property.

```ts
export interface MergeOptions {
  [typeOrName: string]: RecursionOptions | RecursionHandlers | MergeOptions;
}
```

Matching will happen in the following order:

1. Merged object property key matches a key in MergeOptions.
2. The type of the key is referenced in MergeOptions. Note that arrays (which are objects) are treated as being of type 'array' for this purpose.

The values within the options can have the following types:

| Type               | Usage                                                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RecursionOption`  | Behaves as if this value was passed into the recursive call. So 0/false mean merge but don't recurse for the matching child object, less than zero / true means recurse deeply, greater than zero means recurse that many times. |
| `RecursionHandler` | Run a function to handle the merge or invoke one of the built-in handlers for the library. See below for more information.                                                                                                       |
| `MergeOptions`     | Forward the child `MergeOptions` to the child level when making the recursive call.                                                                                                                                              |

### RecursionHandler

When merging values for a given key, providing a recursion handler allows custom processing. A handler function has the following signature:

```ts
export type CustomRecursionHandler = (...vals: any[]) => any;
```

The vals parameter will have collected all the non-undefined values from the input objects. Note that type checking is the responsibility of the handler function.

#### Built in handlers

Built-in handlers can be referenced by name. The currently supported built-in handlers are as follows:

| Handler       | Description                                 |
| ------------- | ------------------------------------------- |
| `appendArray` | Append arrays rather than overwriting them. |

### Example Usage

As an example, imagine props for react components, with a concept called SlotProps that has multiple props in the same object.

```ts
export interface IStandardProps {
  classNames?: string;
  tokens?: ISomeObjectTypeWithoutStyle;
  style?: CSSVariables | CSSVariables[];
  // likely more
}

export interface IMyComponentProps extends IStandardProps {
  // other stuff here
}

export interface IComponentSlotProps {
  root: IMyComponentProps;
  slot1: ISomeOtherComponentProps;
  slot2: IYetAnotherComponentProps;
}
```

In this case style needs to be merged in a special manner and classNames need to be appended. Deep recursion is not desireable in the case where a prop might be an object as with partial values you might get unexpected behavior. Here are some examples of ways to make merge routines:

```ts
// all in one function
export function mergeSlotProps1(...slotProps: ISlotPropsBase[]): ISlotPropsBase {
  return immutableMergeCore({
    // match any object
    object: {
      // match tokens and merge but don't recurse
      tokens: 0,
      // run the string merge routine on classNames
      classNames: (...names: string[]) => { names.map(name => name.trim()).join(' ') },
      // run an existing style merge routine on styles
      style: mergeStyles;
    }
  }, ...slotProps);
}

// this could be broken into two parts, options for props
const propsOptions: MergeOptions = {
  tokens: 0,
  classNames: (...names: string[]) => { names.map(name => name.trim()).join(' ') },
  style: mergeStyles;
}

// then options for slotProps that refer to the props object
const slotPropsOptions: MergeOptions = {
  object: propsOptions;
}

// then a wrapper for each
export function mergeProps<T extends IPropsBase>(...props: T[]): T {
  return immutableMergeCore(propsOptions, ...props);
}

export function mergeSlotProps<T extends ISlotPropsBase>(...slotProps: T[]): T {
  return immutableMergeCore(slotPropsOptions, ...slotProps);
}

```

## processImmutable

The ability to run a handler on something like a style as a part of merge is useful but in normal usage it has some limitations. If there is only one object in a branch or only one value of that type the handler won't run. If the processors are essential functions, or if it is desireable to run processors on a single object you can use `processImmutable`.

```ts
export function processImmutable<T extends object>(options: MergeOptions, ...objs: (T | undefined)[]): T | undefined;
```

This convenience function runs the merge routine as a processor for one or more objects. An example use case might be to turn all style entries into a css class name if it is not already a css class name. This should have the following behavior:

- Style values two levels down should be processed
- The object should remain unchanged if nothing changed
- branches which are unchanged should be untouched
- If a style gets updated the object should be mimally mutated

The usage would be as follows. Given a processor called `myStyleProcessor`:

```ts
let complexObject: IMyObjtype = getObjectFromSomewhere();
complexObject = processImmutable(
  {
    object: {
      object: {
        style: myStyleProcessor,
      },
    },
  },
  complexObject,
);
```

While the primary use case is for a single object this allows merging to happen at the same time if so desired. Merging happens as normal with the exception that processors will still be called in the case where there is only one object.
