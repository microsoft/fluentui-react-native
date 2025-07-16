/* eslint-disable */

import { MergeOptions, immutableMergeCore } from '@fluentui-react-native/framework-base';
import { IComponentSettingsCollection, IComponentSettings, ISlotProps, IOverrideLookup } from './Settings.types';
import { mergeProps } from '@fluentui-react-native/framework-base';

/**
 * an individual settings block is a set of slotProps, with an additional collection of tokens.
 */
const _mergeSettingsOptions: MergeOptions = {
  // tokens should be merged but not recurse
  tokens: 0,

  // all other objects should be treated as props
  object: mergeProps,

  // overrides have a collection of objects which each are treated as settings
  get _overrides() {
    return { object: this };
  },
};

/**
 * A collection of settings simply applies settings down one level
 */
const _mergeCollectionOptions: MergeOptions = {
  object: _mergeSettingsOptions,
};

/**
 * Merge settings together.  This routine should work for IComponentSettings types or ISlotProps
 * @param settings - settings to merge together
 */
export function mergeSettings<TSettings extends IComponentSettings = IComponentSettings>(...settings: (object | undefined)[]): TSettings {
  return immutableMergeCore(_mergeSettingsOptions, ...settings) as TSettings;
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

export function getActiveOverrides(target: IComponentSettings, lookup?: IOverrideLookup): string[] {
  const hasOverride = typeof lookup === 'function' ? lookup : (o) => lookup[o];
  return (target && target._precedence && target._precedence.filter((o) => hasOverride(o))) || [];
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
  const { _overrides, _precedence, ...slotProps } = target;
  return slotProps as ISlotProps;
}
