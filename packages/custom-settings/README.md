# Custom settings package

This package provides a simple library for adding the ability to customize components via settings.

## ISettingsEntry<TSettings, TTheme>

Settings are specified by using `ISettingsEntry`. This can be one of several types which will be handled as follows:

| Type                   | Action                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `string`               | This is interpreted as the name of an entry to load from the theme. Because the theming system is injected this will be done via a callback function.                                        |
| `TSettings`            | This will be a reference to a `IComponentSettings` object to merge with the other values. Note that this should not be mutated as the mutations may not be reflected once values are cached. |
| `(theme) => TSettings` | A function which takes a theme and returns a settings object. This will be resolved once per theme with the results cached.                                                                  |

Note that this module imposes a limitation that the settings can't depend upon props directly. This can be implemented using the `_overrides` on settings objects in an indirect manner.

## getThemedSettings

This is the primary worker routine which resolves a stack of settings, applies any overrides if applicable, and caches the result. Subsequent calls with the same key + override combination will use the cached results.

    export function getThemedSettings<TSettings extends IComponentSettings, TTheme>(
      customSettings: ISettingsEntry<TSettings, TTheme>[],
      theme: TTheme,
      cache: object,
      key: string,
      hasOverride?: IOverrideLookup,
      getFromTheme?: IGetSettingsFromTheme<TSettings, TTheme>
    ): { settings: TSettings | undefined; key: string }

Parameters are used as follows:

| Parameter        | Usage                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `customSettings` | The array of settings entries to merge together                                                                                                                                      |
| `theme`          | Theme used for looking up named settings                                                                                                                                             |
| `cache`          | An object used to cache results. This should be component specific to avoid collisions.                                                                                              |
| `key`            | A string to use to key the cache entries. The settings block with no overrides applied will be under `cache[key]`. Overrides will be appended to build up a longer key in that case. |
| `hasOverride`    | An `IOverrideLookup` to use for figuring out which overrides to apply. If unspecified overrides will not be applied.                                                                 |
| `getFromTheme`   | A function used to look up a named entry from a theme                                                                                                                                |

The resulting settings structure and the built up key are returned as the result of this function.

### getBaseThemedSettings

This is as `getThemedSettings` except that it doesn't resolve overrides. As a result the key does not need to be returned as it will just match `key`.
