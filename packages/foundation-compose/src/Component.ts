import { IComponent, IRenderData, IComponentProps, IComponentOptions } from './Component.types';
import { INativeTheme } from '@uifabric/theming-react-native';
import {
  IProcessResult,
  IResolvedSlot,
  IComposable,
  wrapSlots,
  renderSlot,
  IGenericProps,
  ISlotProps
} from '@uifabric/foundation-composable';
import { mergeSettings, IComponentSettings } from '@uifabric/foundation-settings';
import { getSettings, ITheme } from '@uifabric/theming';
import { processTokens } from '@uifabric/foundation-tokens';
import { getThemedSettings } from '@uifabric/custom-settings';

/**
 * Get the cache for the given component from the theme, creating it if necessary
 *
 * @param component - component to get the cache for, the component object itself will store the unique symbol for its lookups
 * @param theme - theme where the cache will be stored
 */
function _getComponentCache(component: IComponentOptions, theme: INativeTheme): { [key: string]: ISlotProps } {
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

function getSettingsFromTheme(theme: ITheme, name: string): IComponentSettings {
  return getSettings(theme, name).settings;
}

export function _processSettings<TComponent extends IComponent>(component: TComponent, data: IRenderData): IRenderData {
  const { overrides } = component.themeQueryInputs(component.displayName, data);
  const cache = _getComponentCache(component, data.theme);

  const { settings, key } = getThemedSettings(
    component.settings,
    data.theme,
    cache,
    component.displayName,
    overrides,
    getSettingsFromTheme
  );
  data.slotProps = settings;
  data.settingsKey = key;

  return data;
}

/**
 * Run the applicable token processors, caching the result so that other control instances with the same props combinations
 * can re-use the results
 *
 * @param component - component options that holds the token processors
 * @param renderData - render data to update with the results
 */
function _processTokens(component: IComponentOptions, renderData: IRenderData): IRenderData {
  if (component.resolvedTokens) {
    const { props, theme, slotProps, settingsKey } = renderData;
    const cache = _getComponentCache(component, theme);
    renderData.slotProps = processTokens<IComponentProps<IComponent>, ITheme>(
      props,
      theme,
      slotProps,
      component.resolvedTokens,
      settingsKey,
      cache
    );
  }
  return renderData;
}

/**
 * This routine will merge props into slotProps.root, then finalize the result ensuring any new style keys can be authored
 * against the theme names
 *
 * @param renderData - data being prepared for render.
 */
export function standardFinalizer(renderData: IRenderData): IRenderData {
  renderData.slotProps = mergeSettings(renderData.slotProps!, { root: renderData.props });
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
export function useProcessComponent<TOptions extends IComponentOptions<IComponent>>(
  component: TOptions,
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
