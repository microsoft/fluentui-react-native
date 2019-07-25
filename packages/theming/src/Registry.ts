import { ProcessTheme, IThemeEventListener, IThemeRegistry } from './Registry.types';
import { ITheme, IPartialTheme } from './Theme.types';
import { resolvePartialTheme } from './Theme';

/**
 * An entry in the theme registry.
 *
 * Each entry has a `parent`, except for the _hidden_ platform entry.
 *
 * The entry _may_ contain a `definition`, which is either a partial theme, or
 * a ProcessTheme() function that produces a partial theme. Either way, the
 * partial theme is combined with its parent to produce a `resolved` theme.
 */
interface IEntry {
  parentEntryName?: string;
  definition?: IPartialTheme | ProcessTheme;
  resolved?: ITheme;
}

/**
 * A collection of theme registry entries, indexed by name.
 */
interface IEntries {
  [entryName: string]: IEntry;
}

/**
 * `_platformEntry` names the _hidden_ root theme containing platform defaults.
 * It has no parent, and cannot be accessed directly.
 */
const _platformEntryName = '__platform';

/**
 * `_defaultEntry` names the _public_ root theme. It can be changed or replaced.
 * It is always parented to `_platformEntry`.
 */
const _defaultEntryName = '__default';

class ThemeRegistry implements IThemeRegistry {
  private entries: IEntries;
  private listeners: IThemeEventListener[];

  constructor(platformDefaults: ITheme) {
    this.entries = {};
    this.entries[_platformEntryName] = {
      resolved: platformDefaults
    };
    this.entries[_defaultEntryName] = {
      parentEntryName: _platformEntryName
    };
    this.listeners = [];
  }

  public getTheme(name?: string): ITheme {
    return this._getTheme(this._getEntryName(name));
  }

  public setTheme(definition: IPartialTheme | ProcessTheme, name?: string, parent?: string): void {
    const entryName = this._getEntryName(name);
    const parentEntryName = entryName === _defaultEntryName ? _platformEntryName : this._getEntryName(parent);

    if (!this.entries.hasOwnProperty(parentEntryName)) {
      throw new Error('Attempting to parent to an unknown theme');
    }

    if (this._wouldCauseCycle(entryName, parentEntryName)) {
      throw new Error('Attempt to register a dependent theme that would cause a cycle');
    }

    const entry: IEntry = { parentEntryName, definition };

    if (this.entries.hasOwnProperty(entryName)) {
      this._updateEntry(entryName, entry);
    } else {
      this.entries[entryName] = entry;
    }
  }

  public addEventListener(events: IThemeEventListener) {
    this.listeners.push(events);
  }

  public removeEventListener(events: IThemeEventListener) {
    const index = this.listeners.indexOf(events);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public updatePlatformDefaults(platformDefaults: IPartialTheme): void {
    const entry = this._getEntry(_platformEntryName);
    const newPlatformTheme = entry && entry.resolved ? resolvePartialTheme(entry.resolved, platformDefaults) : (platformDefaults as ITheme);
    this._updateEntry(_platformEntryName, {
      resolved: newPlatformTheme
    });
  }

  /**
   * Convert a public theme name to an internal entry name.
   *
   * In most cases, they are the same. However, when `name` is missing or
   * blank, the default entry name is returned.
   *
   * Block access to the _hidden_ platform theme.
   */
  private _getEntryName(name?: string): string {
    if (name === _platformEntryName) {
      throw new Error('The platform theme may not be accessed directly');
    }
    if (!name || name === '') {
      return _defaultEntryName;
    }
    return name;
  }

  /**
   * Get a theme entry object.
   */
  private _getEntry(entryName: string): IEntry {
    if (!this.entries.hasOwnProperty(entryName)) {
      throw Error('"' + entryName + '" does not exist in the theme registry');
    }
    return this.entries[entryName];
  }

  /**
   * Get a theme object, resolving it if necessary.
   */
  private _getTheme(entryName: string): ITheme {
    const entry = this._getEntry(entryName);
    if (!entry.resolved) {
      const parentTheme = this._getTheme(entry.parentEntryName);
      const definition = this._getThemeDefinitionObject(parentTheme, entry.definition);
      entry.resolved = resolvePartialTheme(parentTheme, definition);
    }
    return entry.resolved;
  }

  /**
   * Get a theme definition object. If necessary, create it using a processor.
   */
  private _getThemeDefinitionObject(parentTheme: ITheme, definition?: IPartialTheme | ProcessTheme): IPartialTheme {
    if (definition) {
      if (typeof definition === 'function') {
        const processor = <ProcessTheme>definition;
        return processor(parentTheme);
      }
      return definition;
    }
  }

  /**
   * Returns true if adding this entry to the hierarchy would cause a cycle.
   */
  private _wouldCauseCycle(entryName: string, parentEntryName: string): boolean {
    while (parentEntryName) {
      // if we ever find a self-referencing parent there would be a cycle, this
      // includes parent === name on a single entry
      if (parentEntryName === entryName) {
        return true;
      }
      const parentEntry = this.entries[parentEntryName];
      parentEntryName = parentEntry ? parentEntry.parentEntryName : undefined;
    }
    return false;
  }

  /**
   * Update an entry.
   *
   * Invalidate the current entry, if necessary, as well as child entries.
   */
  private _updateEntry(entryName: string, entry: IEntry): void {
    const toInvalidate: string[] = [];
    if (entryName !== _platformEntryName && this.entries[entryName].resolved) {
      toInvalidate.push(entryName);
    }

    this.entries[entryName] = entry;

    this._clearChildEntries(entryName, toInvalidate);
    toInvalidate.map(invalidateEntryName => {
      const invalidateThemeName = invalidateEntryName === _defaultEntryName ? '' : invalidateEntryName;
      for (const listener of this.listeners) {
        listener.onInvalidate(invalidateThemeName);
      }
    });
  }

  /**
   * Clear the `resolved` theme and any cached styles from all child entries
   * in the hierarchy.
   */
  private _clearChildEntries(parentEntryName: string, toInvalidate: string[]): void {
    for (const entryName of Object.getOwnPropertyNames(this.entries)) {
      const entry = this.entries[entryName];
      if (entry.parentEntryName === parentEntryName && entry.resolved) {
        //  add this theme to the list of those receiving an onInvalidate() callback
        toInvalidate.push(entryName);

        //  remove the theme from the graph
        entry.resolved = undefined;

        //  invalidate all children of this theme entry
        this._clearChildEntries(entryName, toInvalidate);
      }
    }
  }
}

/**
 * Create a theme registry.
 *
 * `platformDefaults` is a theme describing the native platform. This
 * becomes the _hidden_ root theme on which all other themes are based.
 * When the native platform changes (e.g. dark mode), this is updated.
 *
 * **NOTE**: App developers wanting to create a theme reflecting their
 * brand should use the _public_ root theme built into the registry. This
 * theme has no name and dervies from `platformDefaults`. It can be updated,
 * replacing some or all of the native platform defaults.
 */
export function createThemeRegistry(platformDefaults: ITheme): IThemeRegistry {
  return new ThemeRegistry(platformDefaults);
}
