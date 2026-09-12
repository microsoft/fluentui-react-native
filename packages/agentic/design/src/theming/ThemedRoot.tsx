import * as React from 'react';
import { Platform, View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

import { useThemeBoundary } from './context';
import { FlexThemeReference } from './flexThemeReference';
import { RootContext } from './rootContext';
import type { InputModality } from './rootContext';
import { ThemeProvider } from './ThemeProvider';
import type { ThemeProviderProps } from './ThemeProvider';

export interface ThemedRootProps extends IViewProps, Pick<ThemeProviderProps, 'appearance' | 'appearanceSource' | 'fallbackAppearance'> {
  /**
   * Inherits the nearest theme boundary when omitted, or uses the default Flex
   * theme when there is no boundary. An explicit theme starts a new appearance
   * configuration; input modality is still shared with the scene root.
   */
  theme?: ThemeProviderProps['theme'];
}

const defaultTheme = new FlexThemeReference();

/**
 * A View that provides a theme and tracks input modality once per scene.
 */
export const ThemedRoot = React.forwardRef<View, ThemedRootProps>((props, ref) => {
  const { theme, appearance, appearanceSource, fallbackAppearance, children, ...viewProps } = props;
  const parentTheme = useThemeBoundary();
  const parentRoot = React.useContext(RootContext);
  const localRoot = React.useRef<{ inputModality: InputModality }>({ inputModality: 'pointer' });
  const inheritedTheme = theme === undefined ? parentTheme : undefined;
  const resolvedFallback = React.useMemo(
    () => ({ ...inheritedTheme?.fallbackAppearance, ...fallbackAppearance }),
    [inheritedTheme?.fallbackAppearance, fallbackAppearance],
  );
  const { onKeyDown, onKeyDownCapture, onPointerDownCapture, onStartShouldSetResponderCapture } = viewProps;
  const trackKeyDown = React.useCallback<NonNullable<IViewProps['onKeyDown']>>(
    (event) => {
      localRoot.current.inputModality = 'keyboard';
      onKeyDown?.(event);
    },
    [onKeyDown],
  );
  const trackKeyDownCapture = React.useCallback<NonNullable<IViewProps['onKeyDownCapture']>>(
    (event) => {
      localRoot.current.inputModality = 'keyboard';
      onKeyDownCapture?.(event);
    },
    [onKeyDownCapture],
  );
  const trackPointerDown = React.useCallback<NonNullable<IViewProps['onPointerDownCapture']>>(
    (event) => {
      localRoot.current.inputModality = 'pointer';
      onPointerDownCapture?.(event);
    },
    [onPointerDownCapture],
  );
  const trackTouchStart = React.useCallback<NonNullable<IViewProps['onStartShouldSetResponderCapture']>>(
    (event) => {
      localRoot.current.inputModality = 'pointer';
      return onStartShouldSetResponderCapture?.(event) ?? false;
    },
    [onStartShouldSetResponderCapture],
  );
  const trackingProps: IViewProps = parentRoot
    ? {}
    : {
        // Keep the bubbling handler too: desktop native views use it to enable key events.
        ...(Platform.OS !== 'ios' && Platform.OS !== 'android' ? { onKeyDown: trackKeyDown, onKeyDownCapture: trackKeyDownCapture } : {}),
        onPointerDownCapture: trackPointerDown,
        onStartShouldSetResponderCapture: trackTouchStart,
      };

  return (
    <ThemeProvider
      theme={theme ?? inheritedTheme?.source ?? defaultTheme}
      appearance={{ ...inheritedTheme?.appearance.requested, ...appearance }}
      appearanceSource={appearanceSource ?? inheritedTheme?.appearanceSource}
      fallbackAppearance={resolvedFallback}
    >
      <RootContext.Provider value={parentRoot ?? localRoot.current}>
        <View {...viewProps} {...trackingProps} ref={ref}>
          {children}
        </View>
      </RootContext.Provider>
    </ThemeProvider>
  );
});

ThemedRoot.displayName = 'ThemedRoot';
