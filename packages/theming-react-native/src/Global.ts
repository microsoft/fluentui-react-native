import { INativeThemeDefinition, INativeTheme, INativeThemeRegistry } from './INativeTheme.types';
import { getPlatformDefaults, attachToRegistry } from './platform';
import { resolvePartialTheme } from '@uifabricshared/theming-ramp';
import { createThemeRegistry, IProcessTheme, IThemeEventListener } from '@uifabricshared/theme-registry';

let _registry: INativeThemeRegistry;

/**
 * Ensure that `_registry` is set. If not, create it using a native module to
 * provide platform defaults.
 */
export function getThemeRegistry(): INativeThemeRegistry {
  if (!_registry) {
    _registry = createThemeRegistry<INativeTheme, INativeThemeDefinition>(getPlatformDefaults(), resolvePartialTheme);
    attachToRegistry(_registry);
  }
  return _registry;
}

// TODO: attachToRegistry doesn't know how to pull a fresh version of the input platformDefaults
export function createNativeThemeRegistry(platformDefaults?: INativeTheme) {
  const registry = createThemeRegistry(platformDefaults || getPlatformDefaults(), resolvePartialTheme);
  attachToRegistry(registry);
  return registry;
}

/**
 * Set the global theme registry.
 *
 * **WARNING**: This is only exported so that internal tests may override it.
 * It should not be part of this library's public interface.
 *
 * The react tree may contain <ThemeLayer> controls which are tightly bound to
 * `_registry`. Changing `_registry` while the app is running will disrupt
 * theming, causing undefined behavior.
 */
export function setThemeRegistry(registry: INativeThemeRegistry): void {
  _registry = registry;
}

/**
 * Create or update a theme definition
 * @param definition - partial theme definition or processing function that defines the theme
 * @param name - name of the theme, undefined or '' for default
 * @param parent - parent theme to depend on, if unspecified this will pull from the default theme
 */
export function setTheme(
  definition: INativeThemeDefinition | IProcessTheme<INativeTheme, INativeThemeDefinition>,
  name?: string,
  parent?: string
): void {
  return getThemeRegistry().setTheme(definition, name, parent);
}

/**
 * Register a theme event listener
 * @param listener - theme event listener to add
 */
export function addThemeRegistryListener(listener: IThemeEventListener): void {
  return getThemeRegistry().addEventListener(listener);
}

/**
 * Unregister a theme event listener
 * @param listener - theme event listener to remove
 */
export function removeThemeRegistryListener(listener: IThemeEventListener): void {
  return getThemeRegistry().removeEventListener(listener);
}

/**
 * Get a theme by name
 * @param name - name of the theme.  Undefined or '' will resolve to the default theme
 */
export function getTheme(name?: string): INativeTheme {
  return getThemeRegistry().getTheme(name);
}

/**
 * This will update the platform theme.  This is primarily exposed for clients to add custom lookup values to palettes or to
 * add custom typed settings blocks for their own components.
 *
 * @param definition - properties to add to the platform theme.  Note that this will invalidate every theme and cause rerenders
 * if this is not done in the boot sequence.
 */
export function augmentPlatformTheme(definition: INativeThemeDefinition): void {
  getThemeRegistry().updatePlatformDefaults(definition);
}
