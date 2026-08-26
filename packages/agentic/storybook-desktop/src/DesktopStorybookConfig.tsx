import * as React from 'react';

type DesktopStorybookConfig = {
  testIDPrefix: string;
};

const defaultConfig: DesktopStorybookConfig = {
  testIDPrefix: 'storybook-desktop',
};

const DesktopStorybookConfigContext = React.createContext(defaultConfig);

export function DesktopStorybookConfigProvider({ children, testIDPrefix }: React.PropsWithChildren<DesktopStorybookConfig>) {
  const value = React.useMemo(() => ({ testIDPrefix }), [testIDPrefix]);
  return <DesktopStorybookConfigContext.Provider value={value}>{children}</DesktopStorybookConfigContext.Provider>;
}

export function useDesktopStorybookTestID(suffix: string) {
  const { testIDPrefix } = React.useContext(DesktopStorybookConfigContext);
  return `${testIDPrefix}-${suffix}`;
}
