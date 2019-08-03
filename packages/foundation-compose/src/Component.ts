import { IComponent, IRenderData, IComponentProps } from './Component.types';
import { getThemeSettings, finalizeSettings, INativeTheme } from '@uifabric/theming-react-native';
import {
  IProcessResult,
  IResolvedSlot,
  IComposable,
  wrapSlots,
  renderSlot,
  IGenericProps,
  ISlotProps
} from '@uifabric/foundation-composable';
import { mergeSettings } from '@uifabric/theme-settings';
import { IWithTheme } from './Customize.types';
import { getOverrideKey } from '@uifabric/theming/src';
import { resolveSettings } from '@uifabric/theming-react-native/';

/**
 * Get the cache for the given component from the theme, creating it if necessary
 *
 * @param component - component to get the cache for, the component object itself will store the unique symbol for its lookups
 * @param theme - theme where the cache will be stored
 */
function _getComponentCache(component: IComponent, theme: INativeTheme): { [key: string]: ISlotProps } {
  const cacheKey = component.tokenCacheKey!;
  theme[cacheKey] = theme[cacheKey] || {};
  return theme[cacheKey];
}

/**
 * Create a new render data object with props and theme.  State is an empty object unless this routine is
 * overridden.  At that point a component can store what they wish in state.
 *
 * @param props - input props for the component, these will be shallow copied to allow mutating the object
 * @param theme - theme to set into the render data
 */
export function standardPrepareRenderData(props: IGenericProps, theme: INativeTheme): IRenderData {
  return {
    props: { ...props },
    theme,
    state: {}
  };
}

export function standardThemeQueryInputs(name: string, renderData: IRenderData): { name: string; overrides?: object } {
  return { name, overrides: renderData.props };
}

export function _processSettings<TComponent extends IComponent>(component: TComponent, data: IRenderData): IRenderData {
  const { name, overrides } = component.themeQueryInputs(component.className, data);
  let { settings, styleKey } = getThemeSettings(data.theme, name);
  const cache = _getComponentCache(component, data.theme);

  // if there are layers of customized settings apply those, caching along the way and building up the cache key as appropriate
  if (component.customSettings.length > 0) {
    const propsWithTheme = data.props as IWithTheme<IComponentProps<IComponent>>;
    propsWithTheme.theme = data.theme;
    for (const customEntry of component.customSettings) {
      const customSettings = customEntry.settings;
      const queryKeys = customSettings ? ['-'] : customEntry.queryKeys(propsWithTheme);
      styleKey = styleKey + queryKeys.map(k => k || '-').join('-');
      if (cache[styleKey]) {
        settings = cache[styleKey];
      } else {
        cache[styleKey] = settings = mergeSettings(
          settings,
          customEntry.settings ? customEntry.settings : customEntry.getSettings(queryKeys)
        ) as ISlotProps;
      }
    }
    delete propsWithTheme.theme;
  }

  // finally get the override key to append to the merged settings
  styleKey = getOverrideKey(styleKey, settings._precedence || [], overrides);
  if (cache[styleKey]) {
    settings = cache[styleKey];
  } else {
    cache[styleKey] = settings = resolveSettings(data.theme, settings, overrides) as ISlotProps;
  }

  data.slotProps = settings;
  return data;
}

/**
 * At the point the token processor runs only the theme data has been loaded.  This may include values for tokens which
 * will be present in the root entry of the slot props.  This will extract the token keys from these rootProps first, then
 * from the userProps, giving precedence to the user props.
 *
 * The values of the keys that are specified but different in user props are used to build a cache key, applied on top of the
 * theming key for lookups.
 *
 * @param userProps - user props coming into the control
 * @param rootSlotProps - root slot props which provide baseline values
 * @param keys - keys to extract from the set
 */
function _collectKeys(userProps: object, rootSlotProps: object, keys: string[]): { collected: object | undefined; delta: string[] } {
  const collected = {};
  const delta: string[] = [];
  for (const key of keys) {
    if (rootSlotProps.hasOwnProperty(key)) {
      collected[key] = rootSlotProps[key];
    }
    if (userProps.hasOwnProperty(key)) {
      const userProp = userProps[key];
      if (userProp !== collected[key]) {
        delta.push(String(userProp));
      }
      collected[key] = userProp;
    }
  }
  return { collected, delta };
}

/**
 * Run the applicable token processors, caching the result so that other control instances with the same props combinations
 * can re-use the results
 *
 * @param component - component options that holds the token processors
 * @param renderData - render data to update with the results
 */
function _processTokens(component: IComponent, renderData: IRenderData): IRenderData {
  if (component.tokenProcessors && component.tokenKeys) {
    const cache = _getComponentCache(component, renderData.theme);
    const rootProps = (renderData.slotProps && renderData.slotProps.root) || {};
    const { collected, delta } = _collectKeys(renderData.props, rootProps, component.tokenKeys);
    let cacheKey = renderData.settingsKey || 'none';
    if (delta.length > 0) {
      cacheKey = cacheKey.concat('-', delta.join('-'));
    }

    if (cache[cacheKey]) {
      renderData.slotProps = cache[cacheKey];
    } else {
      for (const entry of component.tokenProcessors) {
        renderData.slotProps = entry.processor(collected || {}, renderData);
      }
      if (renderData.slotProps) {
        renderData.slotProps = finalizeSettings(renderData.theme, renderData.slotProps);
      }
      cache[cacheKey] = renderData.slotProps as ISlotProps;
    }
  }
  return renderData;
}

/**
 * Aggregate all the keys together from the token processors and de-dup them
 *
 * @param component - component to aggregate key arrays for
 */
export function mergeTokenKeys(component: IComponent): string[] {
  const collector: { [key: string]: boolean } = {};
  let keys: string[] = [];
  if (component.tokenProcessors) {
    for (const processor of component.tokenProcessors) {
      if (processor.keyProps && processor.keyProps.length > 0) {
        for (const key of processor.keyProps) {
          collector[key] = true;
        }
      }
    }
    keys = Object.keys(collector);
  }
  return keys;
}

/**
 * This routine will merge props into slotProps.root, then finalize the result ensuring any new style keys can be authored
 * against the theme names
 *
 * @param renderData - data being prepared for render.
 */
export function standardFinalizer(renderData: IRenderData): IRenderData {
  renderData.slotProps = finalizeSettings(renderData.theme, mergeSettings(renderData.slotProps!, { root: renderData.props }));
  return renderData;
}

export function standardUsePrepareState(renderData: IRenderData): IRenderData {
  return renderData;
}

/**
 * Process the input props and get all the properties ready to render
 *
 * @param component - component to process the props for
 * @param componentProps - input props passed in
 * @param theme - active theme for this component
 */
export function useProcessComponent<TComponent extends IComponent>(
  component: TComponent,
  userProps: IGenericProps,
  theme: object
): IProcessResult {
  // set up the initial render data and call any hooks for the component
  let renderData = standardPrepareRenderData(userProps, theme as INativeTheme);
  renderData = component.usePrepareState!(renderData);

  // process the base settings from the theme and any component customizations
  renderData = _processSettings(component, renderData);

  // process tokens if any are specified
  renderData = _processTokens(component, renderData);

  // finally run any finalizers on the props
  renderData = component.finalizer ? component.finalizer(renderData) : standardFinalizer(renderData);

  return renderData as IProcessResult;
}

/**
 * Either call the view function if one exists, or just do a simple renderSlot call on the root slot
 *
 * @param component - component options to use for rendering
 * @param result - the resolved slot data for this component.  This will include the IRenderData
 */
export function renderComponent<TComponent extends IComponent>(
  component: TComponent,
  result: IResolvedSlot,
  ...children: React.ReactNode[]
): JSX.Element | null {
  /* tslint:disable-next-line no-any */
  return component.view
    ? component.view(result as any, ...children)
    : (result.slots && result.slots.root && renderSlot(result.slots.root, ...children)) || null;
}

/**
 * Take a component options object and create an IComposable wrapper for it
 *
 * @param component - component options for this component
 */
export function wrapComponent<TComponent extends IComponent>(component: TComponent): IComposable {
  return {
    useProcessProps: (props: IGenericProps, theme: object) => {
      return useProcessComponent(component, props, theme);
    },
    render: (result: IResolvedSlot, ...children: React.ReactNode[]) => {
      return renderComponent(component, result, ...children);
    },
    slots: component.slots ? wrapSlots(component.slots) : undefined
  };
}
