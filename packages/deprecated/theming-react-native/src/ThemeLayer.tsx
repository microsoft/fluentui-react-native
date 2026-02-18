import * as React from 'react';

import type { IThemeEventListener } from '@uifabricshared/theme-registry';
import { ThemeContext } from '@uifabricshared/theming-ramp';

import { removeThemeRegistryListener, getTheme, addThemeRegistryListener } from './Global';
import type { ITheme } from './Theme.types';
import type { FurnJSX } from '@fluentui-react-native/framework-base';

/**
 * props for the ThemeLayer
 * @deprecated
 */
export interface IThemeLayerProps {
  /**
   * If `themeName` is specified this layer will set that theme as the active theme.  Setting the value
   * to '' will explicitly set the default theme as active in the context.  If `themeName` is unspecified
   * the theme layer will act as a consumer and pick up the currently active theme in the context
   */
  themeName?: string;

  /**
   * children function that allows passing of the theme to children.  This is a standard pattern for
   * consumers.
   */
  children: (theme: ITheme) => FurnJSX.Element | null;
}

/**
 * Multipurpose theme provider.  This can run in provider/consumer mode and pure consumer mode.
 *
 * In pure consumer mode the usage is as follows:
 * ```
 *    <ThemeLayer>{(theme: ITheme) => {
 *      return (<MyComponent style={someStyleFn(theme, 'stylename')}/>);
 *    }}</ThemeLayer>
 * ```
 *
 * In provider/consumer mode a themeName will be specified:
 * ```
 *    <ThemeLayer themeName='myTheme'>{(theme: ITheme) => {
 *      return (
 *        <View>
 *          <MySmartComponent/>
 *          <MyComponent style={someStyleFn(theme, 'stylename')}/>
 *        </View>
 *      );
 *    }}</ThemeLayer>
 * ```
 * The work of registering for updates will be done automatically.  The highest level `ThemeLayer` in
 * consumer mode will automatically register and act like a provider to ensure renders happen on theme
 * change
 * @deprecated
 */
export class ThemeLayer extends React.Component<IThemeLayerProps> {
  /**
   * stores the name of the theme if in provider mode.  Existence of this string is tied to registration
   * and is used to signal registration and unregistration
   */
  private _registeredTheme: string | undefined;

  /** handler for theme changes, conditionally will force update */
  public onInvalidate: IThemeEventListener['onInvalidate'] = (name: string) => {
    // only force updates if this theme was the one invalidated
    if (name === this._registeredTheme) {
      this.forceUpdate();
    }
  };

  /** standard cleanup handler to ensure we unregister */
  public componentWillUnmount(): void {
    if (this._registeredTheme !== undefined) {
      removeThemeRegistryListener(this);
      this._registeredTheme = undefined;
    }
  }

  public render(): FurnJSX.Element {
    let themeName = this.props.themeName;
    return (
      <ThemeContext.Consumer>
        {(theme?: ITheme) => {
          // go to provider mode if a themeName is specified or if this is the first consumer and the context
          // is undefined.
          if (themeName !== undefined || theme === undefined) {
            themeName = themeName || '';
            this._ensureCallbackRegistration(themeName);
            theme = getTheme(themeName);
            return <ThemeContext.Provider value={theme}>{this.props.children(theme)}</ThemeContext.Provider>;
          }
          // otherwise in consumer mode just push the current theme to the children
          return this.props.children(theme);
        }}
      </ThemeContext.Consumer>
    );
  }

  /** helper to register if this is the first time and to update the filter if necessary */
  private _ensureCallbackRegistration = (themeName: string) => {
    if (this._registeredTheme === undefined) {
      addThemeRegistryListener(this);
    }
    this._registeredTheme = themeName;
  };
}
