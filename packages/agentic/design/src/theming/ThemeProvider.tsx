import * as React from 'react';

import { resolveThemeAppearance } from './appearance';
import type { ResolvedThemeAppearance, ThemeAppearanceOptions, ThemeAppearanceSource } from './appearance.types';
import { ThemeContext, ThemeSourceContext } from './context';
import { platformAppearance } from './platformAppearance';
import type { ThemeSource } from './themeSource';

export interface ThemeProviderProps extends React.PropsWithChildren<Record<string, unknown>> {
  /**
   * Theme source for this provider boundary.
   */
  theme: ThemeSource;
  appearance?: ThemeAppearanceOptions;
  appearanceSource?: ThemeAppearanceSource;
  fallbackAppearance?: Partial<ResolvedThemeAppearance>;
}

export const ThemeProvider: React.FunctionComponent<ThemeProviderProps> = (props: React.PropsWithChildren<ThemeProviderProps>) => {
  const {
    theme: source,
    appearance: appearanceOverride,
    appearanceSource: appearanceSourceOverride,
    fallbackAppearance: fallbackOverride,
    children,
  } = props;
  const subscribeSource = React.useCallback(
    (listener: () => void) => {
      source.addOnThemeChanged(listener);
      return () => source.removeOnThemeChanged(listener);
    },
    [source],
  );
  const getSourceSnapshot = React.useCallback(() => source.revision, [source]);
  const sourceRevision = React.useSyncExternalStore(subscribeSource, getSourceSnapshot, getSourceSnapshot);
  const appearanceSource = appearanceSourceOverride ?? source.appearanceSource ?? platformAppearance;
  const subscribeAppearance = React.useCallback((listener: () => void) => appearanceSource.subscribe(listener), [appearanceSource]);
  const getAppearanceSnapshot = React.useCallback(() => appearanceSource.getSnapshot(), [appearanceSource]);
  const appearanceSnapshot = React.useSyncExternalStore(subscribeAppearance, getAppearanceSnapshot, getAppearanceSnapshot);
  const appearance = resolveThemeAppearance({ ...source.appearanceOptions, ...appearanceOverride }, appearanceSnapshot, {
    ...source.fallbackAppearance,
    ...fallbackOverride,
  });
  const publishedLegacyTheme = source.kind === 'legacy' ? source.resolveTheme(appearance.resolved) : undefined;
  const sourceContext = React.useMemo(
    () => ({ source, sourceRevision, appearance, publishedLegacyTheme }),
    [appearance, publishedLegacyTheme, source, sourceRevision],
  );

  return (
    <ThemeSourceContext.Provider value={sourceContext}>
      <ThemeContext.Provider value={publishedLegacyTheme}>{children}</ThemeContext.Provider>
    </ThemeSourceContext.Provider>
  );
};
