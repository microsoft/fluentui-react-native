import { MergeOptions, immutableMergeCore } from '@uifabricshared/immutable-merge';
import { IComponentSettingsCollection, IComponentSettings, ISlotProps, IOverrideLookup } from './Settings.types';
import { mergeAndFlattenStyles } from './Styles';
import { IStyleProp } from './Styles.types';

function _mergeStyles(...objs: IStyleProp<object>[]): object | undefined {
  return mergeAndFlattenStyles(undefined, undefined, ...objs);
}

function _mergeClassName(...names: any[]): string | undefined {
  return names.filter(v => v && typeof v === 'string').join(' ');
}

/**
 * Props will not deeply merge with the exception of a style property.  Also className needs to be handled specially.
 */
const _mergePropsOptions: MergeOptions = {
  className: _mergeClassName,
  style: _mergeStyles
};

/**
 * an individual settings block is a set of slotProps, with an additional collection of tokens.
 */
const _mergeSettingsOptions: MergeOptions = {
  // tokens should be merged but not recurse
  tokens: 0,

  // all other objects should be treated as props
  object: _mergePropsOptions
};

/**
 * A collection of settings simply applies settings down one level
 */
const _mergeCollectionOptions: MergeOptions = {
  object: _mergeSettingsOptions
};

/**
 * Create a recursive structure for overrides where the overrides are treated as collections of settings
 */
_mergeSettingsOptions._overrides = _mergeCollectionOptions;

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
 * Merge collections of settings together.  This can handle theme resolution or merging sets of overrides
 * @param collections - the settings collections to merge
 */
export function mergeSettingsCollection<TCollection extends IComponentSettingsCollection = IComponentSettingsCollection>(
  ...collections: object[]
): TCollection {
  return immutableMergeCore(_mergeCollectionOptions, ...collections) as TCollection;
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
  const { _overrides, _precedence, ...slotProps } = target;
  return slotProps as ISlotProps;
}
