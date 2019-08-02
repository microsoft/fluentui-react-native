import { IComponentSettings, IComponentSettingsCollection } from './Settings.types';
import { getParentSettingsChain, mergeSettings } from './Settings';

/**
 * Resolve any parent references for the settings, using the `lookup` collection of settings to lookup
 * parents by name.
 *
 * The process starts with the settings specified by `target`. Settings are merged from the oldest
 * parent forward, up to and including the source settings.
 */
function resolveSettingsParents(lookup: IComponentSettingsCollection, target: string | IComponentSettings): IComponentSettings {
  const collectedSettings = getParentSettingsChain(lookup, target);
  //  merge the hierarhcy
  return mergeSettings(...collectedSettings);
}

interface IProps {
  root: {
    fontFamily?: string;
    fontWeight?: 'light' | 'normal' | 'bold';
    fontSize?: number;
  };
}

const settingsGrandParentName = 'settingsGrandParent';
const settingsGrandParent: IComponentSettings<IProps> = {
  root: {
    fontFamily: 'Helvetica',
    fontWeight: 'light',
    fontSize: 12
  }
};

const settingsParentName = 'settingsParent';
const settingsParent: IComponentSettings<IProps> = {
  _parent: settingsGrandParentName,
  root: {
    fontFamily: 'Verdana',
    fontWeight: 'normal'
  }
};

const settingsChildName = 'settingsChildName';
const settingsChild: IComponentSettings<IProps> = {
  _parent: settingsParentName,
  root: {
    fontFamily: 'Arial',
    fontSize: 11
  }
};

const emptySettingsName = 'emptyLayerName';
const emptySettings: IComponentSettings<IProps> = {};

const collection: IComponentSettingsCollection<IComponentSettings<IProps>> = {};
collection[settingsGrandParentName] = settingsGrandParent;
collection[settingsParentName] = settingsParent;
collection[settingsChildName] = settingsChild;
collection[emptySettingsName] = emptySettings;

describe('Resolve settings parents tests', () => {
  test('resolveSettingsParents returns undefined when the source settings does not exist', () => {
    const flattened: IComponentSettings = resolveSettingsParents({}, 'does not exist');
    expect(flattened).toEqual(undefined);
  });

  test('resolveSettingsParents returns undefined when the source settings is empty', () => {
    const flattened: IComponentSettings<IProps> = resolveSettingsParents(collection, emptySettingsName);
    expect(flattened).toEqual(undefined);
  });

  test('resolveSettingsParents returns the grand-parent settings when starting with the grand-parent settings', () => {
    const flattened: IComponentSettings = resolveSettingsParents(collection, settingsGrandParentName);
    expect(flattened).toEqual(settingsGrandParent);
  });

  test('resolveSettingsParents blends the parent and grand-parent layers when starting with the parent settings', () => {
    const flattened = resolveSettingsParents(collection, settingsParentName);
    expect(flattened).toEqual({
      _parent: settingsGrandParentName,
      root: {
        fontFamily: 'Verdana',
        fontWeight: 'normal',
        fontSize: 12
      }
    });
  });

  test('resolveSettingsParents blends the child, parent and grand-parent when starting with child settings', () => {
    const flattened = resolveSettingsParents(collection, settingsChildName);
    expect(flattened).toEqual({
      _parent: settingsParentName,
      root: {
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontSize: 11
      }
    });
  });
});
