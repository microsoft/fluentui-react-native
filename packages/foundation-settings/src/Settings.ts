import { IMergeOptions, immutableMergeCore } from '@uifabric/immutable-merge';
import { IComponentSettingsCollection, IComponentSettings, ISlotProps, IOverrideLookup } from './Settings.types';
import { mergeAndFlattenStyles } from './Styles';
import { IFinalizeStyle, IStyleProp } from './Styles.types';

/**
 * helper function to switch to a collection merge pattern when _overrides are encountered
 */
function _mergeCollection(_options: IMergeOptions, ...objs: (object | undefined)[]): IComponentSettingsCollection {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return mergeSettingsCollection(...(objs as IComponentSettingsCollection[]));
}

function _mergeStyles(_options: IMergeOptions, ...objs: (IStyleProp<object>)[]): object | undefined {
  return mergeAndFlattenStyles(undefined, undefined, ...objs);
}

/**
 * styles should be flattened and merged
 * tokens should be merged one level
 * overrides should be handled as a collection
 */
const _recurseOptions = {
  style: _mergeStyles,
  tokens: true,
  _overrides: _mergeCollection
};

/**
 * for a single settings block, recurse one level deep to include the various slot props
 */
const _mergeSettingsOptions: IMergeOptions = {
  depth: 1,
  recurse: _recurseOptions
};

/**
 * for a collection of settings, recurse two levels
 */
const _mergeCollectionOptions: IMergeOptions = {
  depth: 2,
  recurse: _recurseOptions
};

const _mergePropsOptions: IMergeOptions = {
  recurse: { style: _mergeStyles, tokens: true }
};

/**
 * Merge settings together.  This routine should work for IComponentSettings types or ISlotProps
 * @param settings - settings to merge together
 */
export function mergeSettings<TSettings extends IComponentSettings = IComponentSettings>(...settings: (object | undefined)[]): TSettings {
  return immutableMergeCore(_mergeSettingsOptions, ...settings) as TSettings;
}

/**
 * Merge props together, flattening and merging styles as appropriate
 * @param props - props to merge together
 */
export function mergeProps<TProps extends object>(...props: (object | undefined)[]): TProps {
  return immutableMergeCore(_mergePropsOptions, ...props) as TProps;
}

/**
 * Merge settings together and run finalization as part of the process
 *
 * @param theme - theme to use for value lookups
 * @param finalizers - finalizers to use for style processing
 * @param settings - settings to merge, can be only a single entry
 */
export function mergeAndFinalizeSettings<TSettings extends IComponentSettings = IComponentSettings>(
  finalizer: IFinalizeStyle,
  ...settings: (object | undefined)[]
): TSettings {
  const mergeOptions: IMergeOptions = {
    depth: 1,
    processSingles: true,
    recurse: {
      ..._recurseOptions,
      style: (_options: IMergeOptions, ...objs: (IStyleProp<object>)[]) => {
        return mergeAndFlattenStyles(finalizer, ...objs);
      }
    }
  };
  return immutableMergeCore(mergeOptions, ...settings) as TSettings;
}

/**
 * Merge collections of settings together.  This can handle theme resolution or merging sets of overrides
 * @param collections - the settings collections to merge
 */
export function mergeSettingsCollection<TCollection extends IComponentSettingsCollection = IComponentSettingsCollection>(
  ...collections: object[]
): TCollection {
  return immutableMergeCore(_mergeCollectionOptions, ...collections) as TCollection;
}

/**
 * Walk the chain of parents, calling the visitor function on each one
 */
function visitSettingsHierarchyDepthFirst(
  collection: IComponentSettingsCollection,
  target: string | IComponentSettings,
  visitor: (settings: IComponentSettings) => void
): void {
  const isSettings = typeof target === 'object';
  if (isSettings || collection.hasOwnProperty(target as string)) {
    const settings = isSettings ? (target as IComponentSettings) : collection[target as string];

    if (settings) {
      //  visit parents first
      if (settings._parent) {
        const parents = Array.isArray(settings._parent) ? settings._parent : [settings._parent];
        for (const parent of parents) {
          visitSettingsHierarchyDepthFirst(collection, parent, visitor);
        }
      }

      //  visit this layer
      visitor(settings);
    }
  }
}

/**
 * Get the set of settings, in the order they should be merged, to resolve the parent chain
 *
 * @param lookup - collection to use for looking up settings
 * @param target - settings entry to use as the root of the lookup chain
 */
export function getParentSettingsChain(lookup: IComponentSettingsCollection, target: string | IComponentSettings): IComponentSettings[] {
  //  gather the entire settings hierarchy into an ordered array
  const collectedSettings: IComponentSettings[] = [];
  visitSettingsHierarchyDepthFirst(lookup, target, settings => collectedSettings.push(settings));
  return collectedSettings;
}

export function getActiveOverrides(target: IComponentSettings, lookup?: IOverrideLookup): string[] {
  const hasOverride = typeof lookup === 'function' ? lookup : o => lookup[o];
  return (target && target._precedence && target._precedence.filter(o => hasOverride(o))) || [];
}

/**
 * Apply overrides to `target`, producing a new settings object if any need to be applied.
 *
 * `overrideLookup` is an object where keys will be looked up in the order specified by the precedence array.
 * The values inside this structure can be any type but will cause the override to apply if they are truthy
 */
export function resolveSettingsOverrides(target: IComponentSettings, overrideLookup?: IOverrideLookup): IComponentSettings {
  let result = target;
  const { _overrides, _precedence } = target;
  if (overrideLookup && _overrides && _precedence) {
    const overrides = getActiveOverrides(target, overrideLookup);
    for (const override of overrides) {
      result = mergeSettings(result, result._overrides[override]);
    }
  }
  return result;
}

/**
 * Turn a settings object into a slot props object.
 * @param target - settings block to strip the settings specific information from
 */
export function slotPropsFromSettings(target: IComponentSettings): ISlotProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _overrides, _parent, _precedence, ...slotProps } = target;
  return slotProps as ISlotProps;
}
