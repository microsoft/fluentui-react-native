import * as React from 'react';

import { appearanceOptionsFromLegacy, resolveThemeAppearance } from './appearance';
import type { ThemeAppearanceState } from './appearance.types';
import { platformAppearance } from './platformAppearance';
import type { ThemeSource } from './themeSource';
import { legacyThemeSourceFromTheme } from './themeSource';
import type { Theme } from './types/Theme.types';

export const ThemeContext = React.createContext<Theme>(undefined);

export interface ThemeSourceContextValue {
  readonly source: ThemeSource;
  readonly sourceRevision: number;
  readonly appearance: Readonly<ThemeAppearanceState>;
  readonly publishedLegacyTheme: Theme | undefined;
}

export const ThemeSourceContext = React.createContext<ThemeSourceContextValue | undefined>(undefined);

export function useThemeBoundary(): ThemeSourceContextValue | undefined {
  const legacyTheme = React.useContext(ThemeContext);
  const sourceContext = React.useContext(ThemeSourceContext);
  const platformSnapshot = platformAppearance.getSnapshot();

  return React.useMemo(() => {
    if (legacyTheme && (!sourceContext || legacyTheme !== sourceContext.publishedLegacyTheme)) {
      return {
        source: legacyThemeSourceFromTheme(legacyTheme),
        sourceRevision: 0,
        appearance: resolveThemeAppearance(appearanceOptionsFromLegacy(legacyTheme.host.appearance), platformSnapshot),
        publishedLegacyTheme: legacyTheme,
      };
    }
    return sourceContext;
  }, [legacyTheme, platformSnapshot, sourceContext]);
}
