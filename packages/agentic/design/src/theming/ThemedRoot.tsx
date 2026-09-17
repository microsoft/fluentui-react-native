import * as React from 'react';
import { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

import { useThemeBoundary } from './context';
import { FlexThemeReference } from './flexThemeReference';
import { RootContext } from './rootContext';
import { createRootInputController, RootInputContext } from './rootInputController';
import { useRootInputProps } from './useRootInputProps';
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
  const parentController = React.useContext(RootInputContext);
  const [localController] = React.useState(createRootInputController);
  const controller = parentController ?? localController;
  const inheritedTheme = theme === undefined ? parentTheme : undefined;
  const resolvedFallback = React.useMemo(
    () => ({ ...inheritedTheme?.fallbackAppearance, ...fallbackAppearance }),
    [inheritedTheme?.fallbackAppearance, fallbackAppearance],
  );
  const trackingProps = useRootInputProps(viewProps, controller, !parentController);

  return (
    <ThemeProvider
      theme={theme ?? inheritedTheme?.source ?? defaultTheme}
      appearance={{ ...inheritedTheme?.appearance.requested, ...appearance }}
      appearanceSource={appearanceSource ?? inheritedTheme?.appearanceSource}
      fallbackAppearance={resolvedFallback}
    >
      <RootInputContext.Provider value={controller}>
        <RootContext.Provider value={controller.settings}>
          <View {...viewProps} {...trackingProps} ref={ref}>
            {children}
          </View>
        </RootContext.Provider>
      </RootInputContext.Provider>
    </ThemeProvider>
  );
});

ThemedRoot.displayName = 'ThemedRoot';
