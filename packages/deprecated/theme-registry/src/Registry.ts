import { IProcessTheme, IThemeEventListener, IThemeRegistry, IResolveTheme } from './Registry.types';

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

/**
 * Convert a public theme name to an internal entry name.
 *
 * In most cases, they are the same. However, when `name` is missing or
 * blank, the default entry name is returned.
 *
 * Block access to the _hidden_ platform theme.
 */
function _getEntryName(name?: string): string {
  if (name === _platformEntryName) {
    throw new Error('The platform theme may not be accessed directly');
  }
  if (!name || name === '') {
    return _defaultEntryName;
  }
  return name;
}

/**
 * Clear the `resolved` theme and any cached styles from all child entries
 * in the hierarchy.
 */
function _clearChildEntries(parentEntryName: string, toInvalidate: string[], entries: IEntries): void {
  for (const entryName of Object.getOwnPropertyNames(entries)) {
    const entry = entries[entryName];
    if (entry.parentEntryName === parentEntryName && entry.resolved) {
      //  add this theme to the list of those receiving an onInvalidate() callback
      toInvalidate.push(entryName);

      //  remove the theme from the graph
      entry.resolved = undefined;

      //  invalidate all children of this theme entry
      _clearChildEntries(entryName, toInvalidate, entries);
    }
  }
}

/**
 * Update an entry.
 *
 * Invalidate the current entry, if necessary, as well as child entries.
 */
function _updateEntry(entryName: string, entry: IEntry, entries: IEntries, listeners: IThemeEventListener[]): void {
  const toInvalidate: string[] = [];
  if (entryName !== _platformEntryName && entries[entryName].resolved) {
    toInvalidate.push(entryName);
  }

  entries[entryName] = entry;

  _clearChildEntries(entryName, toInvalidate, entries);
  toInvalidate.map((invalidateEntryName) => {
    const invalidateThemeName = invalidateEntryName === _defaultEntryName ? '' : invalidateEntryName;
    for (const listener of listeners) {
      listener.onInvalidate(invalidateThemeName);
    }
  });
}

/**
 * Get a theme entry object.
 */
function _getEntry(entryName: string, entries: IEntries): IEntry {
  if (!entries.hasOwnProperty(entryName)) {
    throw Error('"' + entryName + '" does not exist in the theme registry');
  }
  return entries[entryName];
}

/**
 * Get a theme definition object. If necessary, create it using a processor.
 */
function _getThemeDefinitionObject(parentTheme: object, definition?: object | IProcessTheme<object, object>): object {
  if (definition) {
    if (typeof definition === 'function') {
      const processor = <IProcessTheme<object, object>>definition;
      return processor(parentTheme);
    }
    return definition;
  }

  return {};
}

/**
 * Get a theme object, resolving it if necessary.
 */
function _getTheme(entryName: string, entries: IEntries, resolver: IResolveTheme<object, object>): object {
  const entry = _getEntry(entryName, entries);
  if (!entry.resolved) {
    const parentTheme = _getTheme(entry.parentEntryName!, entries, resolver);
    const definition = _getThemeDefinitionObject(parentTheme, entry.definition);
    entry.resolved = resolver(parentTheme, definition);
  }
  return entry.resolved;
}

/**
 * Returns true if adding this entry to the hierarchy would cause a cycle.
 */
function _wouldCauseCycle(entryName: string, parentEntryName: string, entries: IEntries): boolean {
  while (parentEntryName) {
    // if we ever find a self-referencing parent there would be a cycle, this
    // includes parent === name on a single entry
    if (parentEntryName === entryName) {
      return true;
    }
    const parentEntry = entries[parentEntryName];
    parentEntryName = parentEntry ? parentEntry.parentEntryName! : '';
  }
  return false;
}

function _setTheme(
  definition: object | IProcessTheme<object, object>,
  entries: IEntries,
  listeners: IThemeEventListener[],
  name?: string,
  parent?: string,
): void {
  const entryName = _getEntryName(name);
  const parentEntryName = entryName === _defaultEntryName ? _platformEntryName : _getEntryName(parent);

  if (!entries.hasOwnProperty(parentEntryName)) {
    throw new Error('Attempting to parent to an unknown theme');
  }

  if (_wouldCauseCycle(entryName, parentEntryName, entries)) {
    throw new Error('Attempt to register a dependent theme that would cause a cycle');
  }

  const entry: IEntry = { parentEntryName, definition };

  if (entries.hasOwnProperty(entryName)) {
    _updateEntry(entryName, entry, entries, listeners);
  } else {
    entries[entryName] = entry;
  }
}

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
  definition?: object | IProcessTheme<object, object>;
  resolved?: object;
}

/**
 * A collection of theme registry entries, indexed by name.
 */
interface IEntries {
  [entryName: string]: IEntry;
}

export function createThemeRegistry<T extends object, TPartial extends object>(
  initial: T,
  baseResolver: IResolveTheme<T, TPartial>,
): IThemeRegistry<T, TPartial> {
  const entries: IEntries = {
    [_platformEntryName]: { resolved: initial as object },
    [_defaultEntryName]: { parentEntryName: _platformEntryName },
  };
  const listeners: IThemeEventListener[] = [];
  const resolver: IResolveTheme<object, object> = (baseResolver as unknown) as IResolveTheme<object, object>;

  return {
    getTheme: (name?: string) => {
      return _getTheme(_getEntryName(name), entries, resolver) as T;
    },
    setTheme: (definition: TPartial | IProcessTheme<T, TPartial>, name?: string, parent?: string) => {
      _setTheme(definition, entries, listeners, name, parent);
    },
    addEventListener: (events: IThemeEventListener) => {
      listeners.push(events);
    },
    removeEventListener: (events: IThemeEventListener) => {
      const index = listeners.indexOf(events);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    },
    updatePlatformDefaults: (platformDefaults: TPartial) => {
      const entry = _getEntry(_platformEntryName, entries);
      const newPlatformTheme = entry && entry.resolved ? resolver(entry.resolved, platformDefaults) : platformDefaults;
      _updateEntry(
        _platformEntryName,
        {
          resolved: newPlatformTheme,
        },
        entries,
        listeners,
      );
    },
  };
}
