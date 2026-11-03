import * as React from 'react';

import { FlexThemeReference } from '../flex/flexThemeReference';
import { ThemeProvider } from '../theming/ThemeProvider';
import type { ThemeProviderProps } from '../theming/ThemeProvider';
import type { ThemeAppearanceSource } from '../types/appearance.types';

const lightAppearanceSnapshot = Object.freeze({ colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const);

/**
 * Pins the appearance so tests do not depend on the host platform's appearance.
 */
const lightAppearanceSource: ThemeAppearanceSource = {
  getSnapshot: () => lightAppearanceSnapshot,
  subscribe: () => () => undefined,
};

export interface TestThemeProviderProps
  extends React.PropsWithChildren, Partial<Pick<ThemeProviderProps, 'theme' | 'appearance' | 'appearanceSource' | 'fallbackAppearance'>> {}

/**
 * Supplies the theme that Flex hooks require. With no props it provides one default `FlexThemeReference` per mounted
 * provider, pinned to the light, standard, base appearance.
 */
export function TestThemeProvider(props: TestThemeProviderProps): React.JSX.Element {
  const { theme, appearanceSource = lightAppearanceSource, children, ...rest } = props;
  const [defaultTheme] = React.useState(() => new FlexThemeReference());
  return (
    <ThemeProvider {...rest} theme={theme ?? defaultTheme} appearanceSource={appearanceSource}>
      {children}
    </ThemeProvider>
  );
}

/**
 * Creates a stable `wrapper` component for `render`, `renderHook`, or `create` that mounts a `TestThemeProvider`.
 */
export function createThemeWrapper(props: Omit<TestThemeProviderProps, 'children'> = {}): React.ComponentType<React.PropsWithChildren> {
  return function ThemeWrapper({ children }: React.PropsWithChildren): React.JSX.Element {
    return <TestThemeProvider {...props}>{children}</TestThemeProvider>;
  };
}
